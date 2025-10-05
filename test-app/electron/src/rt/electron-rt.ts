import { randomBytes } from 'crypto';
import { ipcRenderer, contextBridge } from 'electron';
import { EventEmitter } from 'events';

// Import the generated plugin list
import { AllPlugins } from './electron-plugins';

// Define the interface for a single plugin, which will be used by the generated plugins file.
export interface ISingleCapacitorElectronPlugin {
  name: string;
  web: () => Promise<any>;
}

const randomId = (length = 5) => randomBytes(length).toString('hex');

const contextApi: {
  [plugin: string]: { [functionName: string]: (...args: any[]) => Promise<any> };
} = {};

const registerPlugins = async () => {
  for (const p of AllPlugins) {
    try {
      const module = await p.web();
      Object.keys(module)
        .filter((className) => className !== 'default')
        .forEach((classKey) => {
          const functionList = Object.getOwnPropertyNames(module[classKey].prototype).filter(
            (v) => v !== 'constructor'
          );

          if (!contextApi[classKey]) {
            contextApi[classKey] = {};
          }

          functionList.forEach((functionName) => {
            if (!contextApi[classKey][functionName]) {
              contextApi[classKey][functionName] = (...args) =>
                ipcRenderer.invoke(`${classKey}-${functionName}`, ...args);
            }
          });

          // Events
          if (module[classKey].prototype instanceof EventEmitter) {
            const listeners: { [key: string]: { type: string; listener: (...args: any[]) => void } } = {};
            const listenersOfTypeExist = (type: string) =>
              !!Object.values(listeners).find((listenerObj) => listenerObj.type === type);

            Object.assign(contextApi[classKey], {
              addListener: (type: string, callback: (...args: any[]) => void) => {
                const id = randomId();

                if (!listenersOfTypeExist(type)) {
                  ipcRenderer.send(`event-add-${classKey}`, type);
                }

                const eventHandler = (_: any, ...args: any[]) => callback(...args);

                ipcRenderer.addListener(`event-${classKey}-${type}`, eventHandler);
                listeners[id] = { type, listener: eventHandler };

                return Promise.resolve(id);
              },
              removeListener: (id: string) => {
                if (!listeners[id]) {
                  return Promise.reject(new Error('Invalid id'));
                }

                const { type, listener } = listeners[id];
                ipcRenderer.removeListener(`event-${classKey}-${type}`, listener);
                delete listeners[id];

                if (!listenersOfTypeExist(type)) {
                  ipcRenderer.send(`event-remove-${classKey}-${type}`);
                }
                return Promise.resolve();
              },
              removeAllListeners: (type: string) => {
                Object.entries(listeners).forEach(([id, listenerObj]) => {
                  if (!type || listenerObj.type === type) {
                    ipcRenderer.removeListener(`event-${classKey}-${listenerObj.type}`, listenerObj.listener);
                    ipcRenderer.send(`event-remove-${classKey}-${type}`);
                    delete listeners[id];
                  }
                });
                return Promise.resolve();
              },
            });
          }
        });
    } catch (e) {
      console.error(`Capacitor Electron: Failed to load plugin ${p.name}.`, e);
    }
  }

  contextBridge.exposeInMainWorld('CapacitorCustomPlatform', {
    name: 'electron',
    plugins: contextApi,
  });
};

registerPlugins();
