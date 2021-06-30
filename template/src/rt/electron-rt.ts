import { ipcRenderer, contextBridge } from "electron";
////////////////////////////////////////////////////////
const plugins = require("./electron-plugins");
const contextApi: {[plugin: string]: {[functionName: string]: () => Promise<any>}} = {};
for (const pluginKey of Object.keys(plugins)) {
  for (const classKey of Object.keys(plugins[pluginKey])) {
    const functionList = Object.getOwnPropertyNames(
      plugins[pluginKey][classKey].prototype
    ).filter((v) => v !== "constructor");
    if (!contextApi[classKey]) {
      contextApi[classKey] = {};
    }
    for (const functionName of functionList) {
      if (!contextApi[classKey][functionName]) {
        contextApi[classKey][functionName] = () => ipcRenderer.invoke(`${classKey}-${functionName}`);
      }
    }
  }
}
contextBridge.exposeInMainWorld('CapacitorCustomPlatform', {name: 'electron', plugins: contextApi})
////////////////////////////////////////////////////////
