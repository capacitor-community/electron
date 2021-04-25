//*
import { addPlatform, setPlatform } from "@capacitor/core";

addPlatform("electron", {
  name: "electron",
  getPlatform: () => {
    return "electron";
  },
});

setPlatform("electron");
//*/

///////////////////////////////////////////////////////////////////////////////////////////////////

/*
import {
  PluginImplementations,
  CapacitorGlobal,
} from "@capacitor/core/types/definitions";
console.log((window as any).Capacitor);
export enum ExceptionCode {
  Unimplemented = "UNIMPLEMENTED",
  Unavailable = "UNAVAILABLE",
}
export class CapacitorException extends Error {
  constructor(readonly message: string, readonly code?: ExceptionCode) {
    super(message);
  }
}
export const createCapacitorElectron = (win: any) => {
  const cap = win.Capacitor || ({} as any);
  const Plugins = (cap.Plugins = cap.Plugins || ({} as any));
  const getPlatform = () => {
    return "electron";
  };
  const isNativePlatform = () => {
    return true;
  };
  const isPluginAvailable = (pluginName: string): boolean => {
    const plugin = registeredPlugins.get(pluginName);
    if (plugin?.platforms.has(getPlatform()) || plugin?.platforms.has("web")) {
      // JS implementation available for the current platform.
      return true;
    }
    if (getPluginHeader(pluginName)) {
      // Native implementation available.
      return true;
    }
    return false;
  };
  const getPluginHeader = (pluginName: string): any | undefined =>
    cap.PluginHeaders?.find((h) => h.name === pluginName);
  const registeredPlugins = new Map<string, any>();
  const registerPlugin = (
    pluginName: string,
    jsImplementations: PluginImplementations = {}
  ): any => {
    const registeredPlugin = registeredPlugins.get(pluginName);
    if (registeredPlugin) {
      console.warn(
        `Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`
      );
      return registeredPlugin.proxy;
    }
    const platform = getPlatform();
    const pluginHeader = getPluginHeader(pluginName);
    let jsImplementation: any;
    const loadPluginImplementation = async (): Promise<any> => {
      if (!jsImplementation && platform in jsImplementations) {
        jsImplementation =
          typeof jsImplementations[platform] === "function"
            ? (jsImplementation = await jsImplementations[platform]())
            : (jsImplementation = jsImplementations[platform]);
      } else if (!jsImplementation && "web" in jsImplementations) {
        jsImplementation =
          typeof jsImplementations["web"] === "function"
            ? (jsImplementation = await jsImplementations["web"]())
            : (jsImplementation = jsImplementations["web"]);
      }
      return jsImplementation;
    };
    const createPluginMethod = (
      impl: any,
      prop: PropertyKey
    ): ((...args: any[]) => any) => {
      if (impl) {
        return impl[prop]?.bind(impl);
      } else if (pluginHeader) {
        const methodHeader = pluginHeader.methods.find((m) => prop === m.name);
        if (methodHeader) {
          if (methodHeader.rtype === "promise") {
            return (options: any) =>
              cap.nativePromise(pluginName, prop.toString(), options);
          } else {
            return (options: any, callback: any) =>
              cap.nativeCallback(
                pluginName,
                prop.toString(),
                options,
                callback
              );
          }
        }
      } else {
        throw new CapacitorException(
          `"${pluginName}" plugin is not implemented on ${platform}`,
          ExceptionCode.Unimplemented
        );
      }
    };
    const createPluginMethodWrapper = (prop: PropertyKey) => {
      let remove: (() => void) | undefined;
      const wrapper = (...args: any[]) => {
        const p = loadPluginImplementation().then((impl) => {
          const fn = createPluginMethod(impl, prop);
          if (fn) {
            const p = fn(...args);
            remove = p?.remove;
            return p;
          } else {
            throw new CapacitorException(
              `"${pluginName}.${
                prop as any
              }()" is not implemented on ${platform}`,
              ExceptionCode.Unimplemented
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
    const addListenerNative = (eventName: string, callback: any) => {
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
      const p = new Promise((resolve) => call.then(() => resolve({ remove })));
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
              return isNativePlatform() ? addListenerNative : addListener;
            case "removeListener":
              return removeListener;
            default:
              return createPluginMethodWrapper(prop);
          }
        },
      }
    );
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

export const initCapacitorGlobal = (win: any): CapacitorGlobal =>
  (win.Capacitor = createCapacitorElectron(win));

export const Capacitor = /*#__PURE__* initCapacitorGlobal(
  (typeof globalThis !== "undefined"
    ? globalThis
    : typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
    ? global
    : {}) as any
);
export const registerPlugin = Capacitor.registerPlugin;
//*/
