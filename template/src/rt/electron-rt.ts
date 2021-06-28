import { ipcRenderer, contextBridge } from "electron";
////////////////////////////////////////////////////////
const plugins = require("./electron-plugins");
console.log(plugins)
const contextApi: {[plugin: string]: {[functionName: string]: () => Promise<any>}} = {};
for (const pluginKey of Object.keys(plugins)) {
  console.log('PluginKey:', pluginKey)
  for (const classKey of Object.keys(plugins[pluginKey])) {
    console.log('ClassKey:', classKey)
    const functionList = Object.getOwnPropertyNames(
      plugins[pluginKey][classKey].prototype
    ).filter((v) => v !== "constructor");
    if (!contextApi[classKey]) {
      contextApi[classKey] = {};
    }
    for (const functionName of functionList) {
      console.log('FunctionKey:', functionName)
      if (!contextApi[classKey][functionName]) {
        contextApi[classKey][functionName] = () => ipcRenderer.invoke(`${classKey}-${functionName}`);
      }
    }
  }
}
contextBridge.exposeInMainWorld('CapacitorCustomPlatform', {name: 'electron', useWebFallbackPlugins: true, plugins: contextApi})
////////////////////////////////////////////////////////
