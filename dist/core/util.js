"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCapacitorConfig = exports.encodeFromFile = exports.setupCapacitorElectronPlugins = exports.pick = exports.deepMerge = exports.getWebAppLoader = exports.CapElectronEventEmitter = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const electron_1 = require("electron");
const electron_serve_1 = require("electron-serve");
const mimeTypes = require("mime-types");
const EventEmitter = require("events");
class CapElectronEmitter extends EventEmitter {
}
exports.CapElectronEventEmitter = new CapElectronEmitter();
function getWebAppLoader(customUrlScheme) {
    return electron_serve_1.default({
        directory: path_1.join(electron_1.app.getAppPath(), "app"),
        // The scheme can be changed to whatever you'd like (ex: someapp)
        scheme: customUrlScheme,
    });
}
exports.getWebAppLoader = getWebAppLoader;
function deepMerge(target, _objects = []) {
    // Credit for original function: Josh Cole(saikojosh)[https://github.com/saikojosh]
    const quickCloneArray = function (input) {
        return input.map(cloneValue);
    };
    const cloneValue = function (value) {
        if (getTypeOf(value) === "object")
            return quickCloneObject(value);
        else if (getTypeOf(value) === "array")
            return quickCloneArray(value);
        return value;
    };
    const getTypeOf = function (input) {
        if (input === null)
            return "null";
        else if (typeof input === "undefined")
            return "undefined";
        else if (typeof input === "object")
            return Array.isArray(input) ? "array" : "object";
        return typeof input;
    };
    const quickCloneObject = function (input) {
        const output = {};
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
                    const existingValue = existingValueType === "object" ? output[key] : {};
                    output[key] = deepMerge({}, [existingValue, quickCloneObject(value)]);
                }
                else {
                    output[key] = quickCloneObject(value);
                }
            }
            else if (type === "array") {
                if (existingValueType === "array") {
                    const newValue = quickCloneArray(value);
                    output[key] = newValue;
                }
                else {
                    output[key] = quickCloneArray(value);
                }
            }
            else {
                output[key] = value;
            }
        }
    }
    return output;
}
exports.deepMerge = deepMerge;
function pick(object, keys) {
    return Object.fromEntries(Object.entries(object).filter(([key]) => keys.includes(key)));
}
exports.pick = pick;
function setupCapacitorElectronPlugins() {
    //setupListeners
    const rtPluginsPath = path_1.join(electron_1.app.getAppPath(), "node_modules", "@capacitor-community", "electron", "dist", "runtime", "electron-plugins.js");
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const AsyncFunction = (async () => { }).constructor;
    const plugins = require(rtPluginsPath);
    const pluginFunctionsRegistry = {};
    const pluginInstanceRegistry = {};
    for (const pluginKey of Object.keys(plugins)) {
        console.log(pluginKey);
        for (const classKey of Object.keys(plugins[pluginKey]).filter((className) => className !== "default")) {
            const functionList = Object.getOwnPropertyNames(plugins[pluginKey][classKey].prototype).filter((v) => v !== "constructor");
            console.log("  ", classKey);
            console.log("    " + JSON.stringify(functionList));
            console.log("");
            if (!pluginFunctionsRegistry[classKey]) {
                pluginInstanceRegistry[classKey] = new plugins[pluginKey][classKey]();
                pluginFunctionsRegistry[classKey] = {};
            }
            for (const functionName of functionList) {
                if (!pluginFunctionsRegistry[classKey][functionName]) {
                    pluginFunctionsRegistry[classKey][functionName] = electron_1.ipcMain.on(`function-${classKey}-${functionName}`, (event, id, ...args) => {
                        const handle = async () => {
                            const pluginRef = pluginInstanceRegistry[classKey];
                            const theCall = pluginRef[functionName];
                            const call = theCall.call(pluginRef, ...args);
                            const isPromise = theCall instanceof Promise ||
                                theCall instanceof AsyncFunction ||
                                call instanceof Promise;
                            if (isPromise) {
                                try {
                                    const returnVal = await call;
                                    event.reply(`function-${classKey}-${functionName}-reply`, id, returnVal !== null && returnVal !== void 0 ? returnVal : null);
                                }
                                catch (err) {
                                    event.reply(`function-${classKey}-${functionName}-reply`, id, err, true);
                                }
                            }
                            else {
                                event.returnValue = call;
                            }
                        };
                        handle().catch((error) => {
                            console.error(error);
                            event.returnValue = error;
                        });
                    });
                }
            }
            if (pluginInstanceRegistry[classKey] instanceof EventEmitter) {
                electron_1.ipcMain.on(`event-add-${classKey}`, (event, type) => {
                    const eventHandler = (...data) => event.sender.send(`event-${classKey}-${type}`, ...data);
                    pluginInstanceRegistry[classKey].addListener(type, eventHandler);
                    electron_1.ipcMain.once(`event-remove-${classKey}`, (_, type) => {
                        pluginFunctionsRegistry[classKey].removeListener(type, eventHandler);
                    });
                });
            }
        }
    }
}
exports.setupCapacitorElectronPlugins = setupCapacitorElectronPlugins;
async function encodeFromFile(filePath) {
    if (!filePath) {
        throw new Error("filePath is required.");
    }
    let mediaType = mimeTypes.lookup(filePath);
    if (!mediaType) {
        throw new Error("Media type unrecognized.");
    }
    const fileData = fs_1.readFileSync(filePath);
    mediaType = /\//.test(mediaType) ? mediaType : "image/" + mediaType;
    let dataBase64 = Buffer.isBuffer(fileData)
        ? fileData.toString("base64")
        : Buffer.from(fileData).toString("base64");
    return "data:" + mediaType + ";base64," + dataBase64;
}
exports.encodeFromFile = encodeFromFile;
function getCapacitorConfig() {
    let config = {};
    let capFileConfig = {};
    if (fs_1.existsSync(path_1.join(electron_1.app.getAppPath(), "build", "capacitor.config.js"))) {
        capFileConfig = require(path_1.join(electron_1.app.getAppPath(), "build", "capacitor.config.js")).default;
    }
    else {
        capFileConfig = JSON.parse(fs_1.readFileSync(path_1.join(electron_1.app.getAppPath(), "capacitor.config.json")).toString());
    }
    if (capFileConfig.electron)
        config = deepMerge(config, [
            Object.assign(Object.assign({}, capFileConfig.electron), pick(capFileConfig, ["backgroundColor", "appId", "appName"])),
        ]);
    return config;
}
exports.getCapacitorConfig = getCapacitorConfig;
//# sourceMappingURL=util.js.map