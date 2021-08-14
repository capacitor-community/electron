import { join } from "path";
import { existsSync, readFileSync } from 'fs';
import { app, ipcMain } from "electron";
import type { CapacitorElectronConfig } from "./definitions";
import electronServe from 'electron-serve';
const mimeTypes = require('mime-types');
const EventEmitter = require('events');

class CapElectronEmitter extends EventEmitter {}

export const CapElectronEventEmitter = new CapElectronEmitter();

export function getWebAppLoader(customUrlScheme: string) {
  return electronServe({
    directory: join(app.getAppPath(), "app"),
    // The scheme can be changed to whatever you'd like (ex: someapp)
    scheme: customUrlScheme,
  });
}

export function deepMerge(target: any, _objects: any[] = []) {
  // Credit for origanal function: Josh Cole(saikojosh)[https://github.com/saikojosh]
  const quickCloneArray = function (input: any) {
    return input.map(cloneValue);
  };
  const cloneValue = function (value: any) {
    if (getTypeOf(value) === "object") return quickCloneObject(value);
    else if (getTypeOf(value) === "array") return quickCloneArray(value);
    return value;
  };
  const getTypeOf = function (input: any) {
    if (input === null) return "null";
    else if (typeof input === "undefined") return "undefined";
    else if (typeof input === "object")
      return Array.isArray(input) ? "array" : "object";
    return typeof input;
  };
  const quickCloneObject = function (input: any) {
    const output: any = {};
    for (const key in input) {
      if (!input.hasOwnProperty(key)) {
        continue;
      }
      output[key] = cloneValue(input[key]);
    }
    return output;
  };
  const objects = _objects.map((object) => object || {});
  const output = target || {};
  for (let oindex = 0; oindex < objects.length; oindex++) {
    const object = objects[oindex];
    const keys = Object.keys(object);
    for (let kindex = 0; kindex < keys.length; kindex++) {
      const key = keys[kindex];
      const value = object[key];
      const type = getTypeOf(value);
      const existingValueType = getTypeOf(output[key]);
      if (type === "object") {
        if (existingValueType !== "undefined") {
          const existingValue =
            existingValueType === "object" ? output[key] : {};
          output[key] = deepMerge({}, [existingValue, quickCloneObject(value)]);
        } else {
          output[key] = quickCloneObject(value);
        }
      } else if (type === "array") {
        if (existingValueType === "array") {
          const newValue = quickCloneArray(value);
          output[key] = newValue;
        } else {
          output[key] = quickCloneArray(value);
        }
      } else {
        output[key] = value;
      }
    }
  }
  return output;
}

export function setupCapacitorElectronPlugins() {
  //setupListeners
  const rtPluginsPath = join(
    app.getAppPath(),
    "node_modules",
    "@capacitor-community",
    "electron",
    "dist",
    "runtime",
    "electron-plugins.js"
  )
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const AsyncFunction = (async () => {}).constructor;
  const plugins: any = require(rtPluginsPath)
  const pluginFunctionsRegistry: any = {}
  for (const pluginKey of Object.keys(plugins)) {
    console.log(pluginKey)
    for (const classKey of Object.keys(plugins[pluginKey]).filter(
      className => className !== 'default',
    )) {
      const functionList = Object.getOwnPropertyNames(plugins[pluginKey][classKey].prototype).filter(v => v !== 'constructor')
      console.log('  ', classKey)
      console.log('    ' + JSON.stringify(functionList))
      console.log('')
      if (!pluginFunctionsRegistry[classKey]) {
        pluginFunctionsRegistry[classKey] = {}
      }
      for (const functionName of functionList) {
        if (!pluginFunctionsRegistry[classKey][functionName]) {
          pluginFunctionsRegistry[classKey][functionName] = ipcMain.on(`${classKey}-${functionName}`, async (event, ...args) => {
            console.log('args')
            console.log(args)
            const pluginRef = new plugins[pluginKey][classKey]()
            const theCall = pluginRef[functionName]
            console.log('theCall')
            console.log(theCall)
            const call = theCall.call(pluginRef, ...args);
            const isPromise = theCall instanceof Promise || (theCall instanceof AsyncFunction) || call instanceof Promise;
            console.log('isPromise')
            console.log(isPromise)
            if (isPromise) {
              event.reply(`${classKey}-${functionName}-reply`, (await call) ?? null)
            } else {
              event.returnValue = call;
            }
          })
        }
      }
    }
  }
}

export async function encodeFromFile(filePath: string): Promise<string> {
  if (!filePath) {
    throw new Error("filePath is required.");
  }
  let mediaType = mimeTypes.lookup(filePath);
  if (!mediaType) {
    throw new Error("Media type unreconized.");
  }
  const fileData = readFileSync(filePath);
  mediaType = /\//.test(mediaType) ? mediaType : "image/" + mediaType;
  let dataBase64 = Buffer.isBuffer(fileData)
    ? fileData.toString("base64")
    : new Buffer(fileData).toString("base64");
  return "data:" + mediaType + ";base64," + dataBase64;
}

export function getCapacitorConfig() {
  let config: CapacitorElectronConfig = {};
  let capFileConfig: any = {}
  if (existsSync(join(app.getAppPath(), "build", "capacitor.config.js"))) {
    capFileConfig = require(join(app.getAppPath(), "build", "capacitor.config.js")).default;
  } else {
    capFileConfig = JSON.parse(readFileSync(join(app.getAppPath(), "capacitor.config.json")).toString());
  }
  if (capFileConfig.electron) config = deepMerge(config, [capFileConfig.electron]);
  return config;
}
