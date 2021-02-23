"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPlugin = exports.Capacitor = exports.initCapacitorGlobal = exports.createCapacitorElectron = exports.CapacitorException = exports.ExceptionCode = void 0;
console.log(window.Capacitor);
var ExceptionCode;
(function (ExceptionCode) {
    /**
     * API is not implemented.
     *
     * This usually means the API can't be used because it is not implemented for
     * the current platform.
     */
    ExceptionCode["Unimplemented"] = "UNIMPLEMENTED";
    /**
     * API is not available.
     *
     * This means the API can't be used right now because:
     *   - it is currently missing a prerequisite, such as network connectivity
     *   - it requires a particular platform or browser version
     */
    ExceptionCode["Unavailable"] = "UNAVAILABLE";
})(ExceptionCode = exports.ExceptionCode || (exports.ExceptionCode = {}));
class CapacitorException extends Error {
    constructor(message, code) {
        super(message);
        this.message = message;
        this.code = code;
    }
}
exports.CapacitorException = CapacitorException;
const createCapacitorElectron = (win) => {
    const cap = win.Capacitor || {};
    const Plugins = (cap.Plugins = cap.Plugins || {});
    const getPlatform = () => {
        return "electron";
    };
    const isNativePlatform = () => {
        return true;
    };
    const isPluginAvailable = (pluginName) => {
        const plugin = registeredPlugins.get(pluginName);
        if ((plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) || (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has("web"))) {
            // JS implementation available for the current platform.
            return true;
        }
        if (getPluginHeader(pluginName)) {
            // Native implementation available.
            return true;
        }
        return false;
    };
    const getPluginHeader = (pluginName) => { var _a; return (_a = cap.PluginHeaders) === null || _a === void 0 ? void 0 : _a.find((h) => h.name === pluginName); };
    const registeredPlugins = new Map();
    const registerPlugin = (pluginName, jsImplementations = {}) => {
        const registeredPlugin = registeredPlugins.get(pluginName);
        if (registeredPlugin) {
            console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
            return registeredPlugin.proxy;
        }
        const platform = getPlatform();
        const pluginHeader = getPluginHeader(pluginName);
        let jsImplementation;
        const loadPluginImplementation = async () => {
            if (!jsImplementation && platform in jsImplementations) {
                jsImplementation =
                    typeof jsImplementations[platform] === "function"
                        ? (jsImplementation = await jsImplementations[platform]())
                        : (jsImplementation = jsImplementations[platform]);
            }
            else if (!jsImplementation && "web" in jsImplementations) {
                jsImplementation =
                    typeof jsImplementations["web"] === "function"
                        ? (jsImplementation = await jsImplementations["web"]())
                        : (jsImplementation = jsImplementations["web"]);
            }
            return jsImplementation;
        };
        const createPluginMethod = (impl, prop) => {
            var _a;
            if (impl) {
                return (_a = impl[prop]) === null || _a === void 0 ? void 0 : _a.bind(impl);
            }
            else if (pluginHeader) {
                const methodHeader = pluginHeader.methods.find((m) => prop === m.name);
                if (methodHeader) {
                    if (methodHeader.rtype === "promise") {
                        return (options) => cap.nativePromise(pluginName, prop.toString(), options);
                    }
                    else {
                        return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
                    }
                }
            }
            else {
                throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
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
                        throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
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
                        return isNativePlatform() ? addListenerNative : addListener;
                    case "removeListener":
                        return removeListener;
                    default:
                        return createPluginMethodWrapper(prop);
                }
            },
        });
        Plugins[pluginName] = proxy;
        registeredPlugins.set(pluginName, {
            name: pluginName,
            proxy,
            platforms: new Set([
                ...Object.keys(jsImplementations),
                ...(pluginHeader ? [platform] : []),
            ]),
        });
        return proxy;
    };
    cap.getPlatform = getPlatform;
    cap.isNativePlatform = isNativePlatform;
    cap.isPluginAvailable = isPluginAvailable;
    cap.registerPlugin = registerPlugin;
    cap.RUNTIME_OVERRIDE = true;
    return cap;
};
exports.createCapacitorElectron = createCapacitorElectron;
const initCapacitorGlobal = (win) => (win.Capacitor = exports.createCapacitorElectron(win));
exports.initCapacitorGlobal = initCapacitorGlobal;
exports.Capacitor = exports.initCapacitorGlobal((typeof globalThis !== "undefined"
    ? globalThis
    : typeof self !== "undefined"
        ? self
        : typeof window !== "undefined"
            ? window
            : typeof global !== "undefined"
                ? global
                : {}));
exports.registerPlugin = exports.Capacitor.registerPlugin;
//# sourceMappingURL=electron-rt.js.map