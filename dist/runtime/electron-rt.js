"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CapacitorException extends Error {
    constructor(message, _code) {
        super(message);
    }
}
const core_1 = require("@capacitor/core");
const { ipcRenderer } = require("electron");
const plugins = require("./electron-plugins");
const { EventEmitter } = require("events");
const crypto = require("crypto");
const getRandomId = () => crypto.pseudoRandomBytes(5).toString("hex");
core_1.addPlatform("electron", {
    name: "electron",
    isNativePlatform: () => true,
    getPlatform: () => {
        return "electron";
    },
    registerPlugin: (pluginName, jsImplementations = {}) => {
        console.log(jsImplementations);
        const registeredPlugin = window.CapacitorElectronPlugins[pluginName];
        console.log("electron register plugin", pluginName);
        console.log(registeredPlugin);
        if (registeredPlugin) {
            window.Capacitor.Plugins[pluginName] = window.CapacitorElectronPlugins[pluginName];
            return window.CapacitorElectronPlugins[pluginName];
        }
        else {
            console.log("load web imp");
            const cap = window.Capacitor;
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
                var _a, _b;
                if (pluginHeader) {
                    const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find((m) => prop === m.name);
                    if (methodHeader) {
                        if (methodHeader.rtype === "promise") {
                            return (options) => cap.nativePromise(pluginName, prop.toString(), options);
                        }
                        else {
                            return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
                        }
                    }
                    else if (impl) {
                        return (_a = impl[prop]) === null || _a === void 0 ? void 0 : _a.bind(impl);
                    }
                }
                else if (impl) {
                    return (_b = impl[prop]) === null || _b === void 0 ? void 0 : _b.bind(impl);
                }
                else {
                    throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, "Unimplemented");
                }
            };
            const createPluginMethodWrapper = (prop) => {
                let remove;
                const wrapper = (...args) => {
                    const p = loadPluginImplementation().then((impl) => {
                        const fn = createPluginMethod(impl, prop);
                        if (fn) {
                            const p = fn(...args);
                            remove = p === null || p === void 0 ? void 0 : p.remove;
                            return p;
                        }
                        else {
                            throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, "UNIMPLEMENTED");
                        }
                    });
                    if (prop === "addListener") {
                        p.remove = async () => remove();
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
                    removeListener({
                        eventName,
                        callbackId,
                    }, callback);
                };
                const p = new Promise((resolve) => call.then(() => resolve({ remove })));
                p.remove = async () => {
                    console.warn(`Using addListener() without 'await' is deprecated.`);
                    await remove();
                };
                return p;
            };
            const proxy = new Proxy({}, {
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
            });
            window.Capacitor.Plugins[pluginName] = proxy;
            return proxy;
        }
    },
});
core_1.setPlatform("electron");
const pluginsRegistry = {};
const pluginInstanceRegistry = {};
const AsyncFunction = (async () => { }).constructor;
for (const pluginKey of Object.keys(plugins)) {
    for (const classKey of Object.keys(plugins[pluginKey]).filter((className) => className !== "default")) {
        const functionList = Object.getOwnPropertyNames(plugins[pluginKey][classKey].prototype).filter((v) => v !== "constructor");
        if (!pluginsRegistry[classKey]) {
            pluginInstanceRegistry[classKey] = new plugins[pluginKey][classKey]();
            pluginsRegistry[classKey] = {};
        }
        for (const functionName of functionList) {
            if (!pluginsRegistry[classKey][functionName]) {
                const pluginRef = pluginInstanceRegistry[classKey];
                const isPromise = pluginRef[functionName] instanceof Promise ||
                    pluginRef[functionName] instanceof AsyncFunction;
                if (isPromise) {
                    pluginsRegistry[classKey][functionName] = (...sendArgs) => {
                        const id = getRandomId();
                        return new Promise((resolve, reject) => {
                            console.log(`sending async ipc from renderer of channel: ${classKey}-${functionName}`);
                            const listener = (_event, returnedId, returnedValue, threw = false) => {
                                if (returnedId === id) {
                                    console.log("got reply of:", returnedValue);
                                    ipcRenderer.removeListener(`function-${classKey}-${functionName}-reply`, listener);
                                    if (threw) {
                                        reject(returnedValue);
                                    }
                                    else {
                                        resolve(returnedValue);
                                    }
                                }
                            };
                            ipcRenderer.on(`function-${classKey}-${functionName}-reply`, listener);
                            ipcRenderer.send(`function-${classKey}-${functionName}`, id, ...sendArgs);
                        });
                    };
                }
                else {
                    pluginsRegistry[classKey][functionName] = (...sendArgs) => {
                        console.log(`sending sync ipc from renderer of channel: ${classKey}-${functionName}`);
                        return ipcRenderer.sendSync(`function-${classKey}-${functionName}`, "", ...sendArgs);
                    };
                }
            }
        }
        if (pluginInstanceRegistry[classKey] instanceof EventEmitter) {
            const listeners = {};
            pluginsRegistry[classKey].events = {
                addEventListener(type, callback) {
                    if (!listeners[type]) {
                        ipcRenderer.send(`event-add-${classKey}`, type);
                        listeners[type] = new Map();
                    }
                    const eventHandler = (_, ...args) => callback(...args);
                    ipcRenderer.addListener(`event-${classKey}-${type}`, eventHandler);
                    listeners[type].set(callback, eventHandler);
                },
                removeEventListener(type, callback) {
                    if (listeners[type]) {
                        ipcRenderer.removeListener(`event-${classKey}-${type}`, listeners[type].get(callback));
                        listeners[type].delete(callback);
                        if (listeners[type].size < 1) {
                            ipcRenderer.send(`event-remove-${classKey}`, type);
                            delete listeners[type];
                        }
                    }
                }
            };
        }
    }
}
window.CapacitorElectronPlugins = Object.assign({}, pluginsRegistry);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//# sourceMappingURL=electron-rt.js.map