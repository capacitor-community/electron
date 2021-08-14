class CapacitorException extends Error {
  constructor(message, _code) {
    super(message);
  }
}
import { addPlatform, setPlatform } from "@capacitor/core";
import type { PluginImplementations } from "@capacitor/core";
const { ipcRenderer } = require("electron");
const plugins = require("./electron-plugins");
const crypto = require("crypto");

const getRandomId = () => crypto.pseudoRandomBytes(5).toString("hex");

addPlatform("electron", {
  name: "electron",
  getPlatform: () => {
    return "electron";
  },
  registerPlugin: (
    pluginName: string,
    jsImplementations: PluginImplementations = {}
  ) => {
    console.log(jsImplementations);
    const registeredPlugin = (window as any).CapacitorElectronPlugins[pluginName];
    console.log("electron register plugin", pluginName);
    console.log(registeredPlugin);
    if (registeredPlugin) {
      (window as any).Capacitor.Plugins[pluginName] =
        (window as any).CapacitorElectronPlugins[pluginName];
      return (window as any).CapacitorElectronPlugins[pluginName];
    } else {
      console.log("load web imp");
      const cap = (window as any).Capacitor;
      const platform = "web";
      const pluginHeader = null;
      let jsImplementation;
      const loadPluginImplementation = async () => {
        if (!jsImplementation && platform in jsImplementations) {
          jsImplementation =
            typeof jsImplementations[platform] === "function"
              ? (jsImplementation = await jsImplementations[platform]())
              : (jsImplementation = jsImplementations[platform]);
        }

        return jsImplementation;
      };
      const createPluginMethod = (impl, prop) => {
        if (pluginHeader) {
          const methodHeader = pluginHeader?.methods.find(
            (m) => prop === m.name
          );
          if (methodHeader) {
            if (methodHeader.rtype === "promise") {
              return (options) =>
                cap.nativePromise(pluginName, prop.toString(), options);
            } else {
              return (options, callback) =>
                cap.nativeCallback(
                  pluginName,
                  prop.toString(),
                  options,
                  callback
                );
            }
          } else if (impl) {
            return impl[prop]?.bind(impl);
          }
        } else if (impl) {
          return impl[prop]?.bind(impl);
        } else {
          throw new CapacitorException(
            `"${pluginName}" plugin is not implemented on ${platform}`,
            "Unimplemented"
          );
        }
      };
      const createPluginMethodWrapper = (prop) => {
        let remove;
        const wrapper = (...args) => {
          const p = loadPluginImplementation().then((impl) => {
            const fn = createPluginMethod(impl, prop);

            if (fn) {
              const p = fn(...args);
              remove = p?.remove;
              return p;
            } else {
              throw new CapacitorException(
                `"${pluginName}.${prop}()" is not implemented on ${platform}`,
                "UNIMPLEMENTED"
              );
            }
          });

          if (prop === "addListener") {
            (p as any).remove = async () => remove();
          }

          return p;
        };

        // Some flair ✨
        wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
        Object.defineProperty(wrapper, "name", {
          value: prop,
          writable: false,
          configurable: false,
        });

        return wrapper;
      };
      const addListener = createPluginMethodWrapper("addListener");
      const removeListener = createPluginMethodWrapper("removeListener");
      const addListenerNative = (eventName, callback) => {
        const call = addListener({ eventName }, callback);
        const remove = async () => {
          const callbackId = await call;

          removeListener(
            {
              eventName,
              callbackId,
            },
            callback
          );
        };

        const p = new Promise((resolve) =>
          call.then(() => resolve({ remove }))
        );

        (p as any).remove = async () => {
          console.warn(`Using addListener() without 'await' is deprecated.`);
          await remove();
        };

        return p;
      };
      const proxy = new Proxy(
        {},
        {
          get(_, prop) {
            switch (prop) {
              // https://github.com/facebook/react/issues/20030
              case "$$typeof":
                return undefined;
              case "addListener":
                return pluginHeader ? addListenerNative : addListener;
              case "removeListener":
                return removeListener;
              default:
                return createPluginMethodWrapper(prop);
            }
          },
        }
      );
      (window as any).Capacitor.Plugins[pluginName] = proxy;
      return proxy;
    }
  },
});
setPlatform("electron");
const pluginsRegistry: any = {};
const AsyncFunction = (async () => {}).constructor;
for (const pluginKey of Object.keys(plugins)) {
  for (const classKey of Object.keys(plugins[pluginKey]).filter(
    className => className !== 'default',
  )) {
    const functionList = Object.getOwnPropertyNames(
      plugins[pluginKey][classKey].prototype
    ).filter((v) => v !== "constructor");
    if (!pluginsRegistry[classKey]) {
      pluginsRegistry[classKey] = {};
    }
    for (const functionName of functionList) {
      if (!pluginsRegistry[classKey][functionName]) {
        const pluginRef = new plugins[pluginKey][classKey]();
        const isPromise =
          pluginRef[functionName] instanceof Promise ||
          pluginRef[functionName] instanceof AsyncFunction;
        if (isPromise) {
          pluginsRegistry[classKey][functionName] = (...sendArgs: any) => {
            const id = getRandomId();
            return new Promise((resolve, _reject) => {
              console.log(
                `sending async ipc from renderer of channel: ${classKey}-${functionName}`
              );
              const listener = (_event: any, returnedId: string, returnedValue: unknown) => {
                if (returnedId === id) {
                  console.log("got reply of:", returnedValue);
                  ipcRenderer.removeListener(
                    `${classKey}-${functionName}-reply`,
                    listener
                  );
                  resolve(returnedValue);
                }
              };
              ipcRenderer.on(`${classKey}-${functionName}-reply`, listener);
              ipcRenderer.send(`${classKey}-${functionName}`, id, ...sendArgs);
            });
          };
        } else {
          pluginsRegistry[classKey][functionName] = (...sendArgs: any) => {
            console.log(
              `sending sync ipc from renderer of channel: ${classKey}-${functionName}`
            );
            return ipcRenderer.sendSync(
              `${classKey}-${functionName}`,
              "",
              ...sendArgs
            );
          };
        }
      }
    }
  }
}
(window as any).CapacitorElectronPlugins = { ...pluginsRegistry };
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
