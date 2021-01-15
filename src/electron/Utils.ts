import Electron from "electron";

const fs = require("fs");
const mimeTypes = require("mime-types");

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

export async function configCapacitor(
  mainWindow: Electron.BrowserWindow,
  config: any
) {
  let capConfigJson = config;
  const appendUserAgent =
    capConfigJson.electron && capConfigJson.electron.appendUserAgent
      ? capConfigJson.electron.appendUserAgent
      : capConfigJson.appendUserAgent;
  if (appendUserAgent) {
    mainWindow.webContents.setUserAgent(
      mainWindow.webContents.getUserAgent() + " " + appendUserAgent
    );
  }
  const overrideUserAgent =
    capConfigJson.electron && capConfigJson.electron.overrideUserAgent
      ? capConfigJson.electron.overrideUserAgent
      : capConfigJson.overrideUserAgent;
  if (overrideUserAgent) {
    mainWindow.webContents.setUserAgent(overrideUserAgent);
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
  const fileData = fs.readFileSync(filePath);
  mediaType = /\//.test(mediaType) ? mediaType : "image/" + mediaType;
  let dataBase64 = Buffer.isBuffer(fileData)
    ? fileData.toString("base64")
    : new Buffer(fileData).toString("base64");
  return "data:" + mediaType + ";base64," + dataBase64;
}
