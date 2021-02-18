// import '@capacitor/core';
import {
  PluginImplementations,
  CapacitorGlobal,
} from "@capacitor/core/types/definitions";
// require('./node_modules/@capacitor-community/electron/dist/electron-bridge.js');
console.log((window as any).Capacitor);

export const initVendor = (win: any, cap: any): void => {
  const Ionic = (win.Ionic = win.Ionic || {});
  const IonicWebView = (Ionic.WebView = Ionic.WebView || {});
  const Plugins = (cap.Plugins as any) as { WebView: any };

  IonicWebView.getServerBasePath = (callback: (path: string) => void) => {
    Plugins?.WebView?.getServerBasePath().then((result) => {
      callback(result.path);
    });
  };

  IonicWebView.setServerBasePath = (path: string) => {
    Plugins?.WebView?.setServerBasePath({ path });
  };

  IonicWebView.persistServerBasePath = () => {
    Plugins?.WebView?.persistServerBasePath();
  };

  IonicWebView.convertFileSrc = (url: string) => cap.convertFileSrc(url);
};
export const initLegacyHandlers = (win: any, cap: any): void => {
  // define cordova if it's not there already
  win.cordova = win.cordova || {};

  const doc = win.document;
  const nav = win.navigator;

  if (nav) {
    nav.app = nav.app || {};
    nav.app.exitApp = () => {
      cap.nativeCallback("App", "exitApp", {});
    };
  }

  if (doc) {
    const docAddEventListener = doc.addEventListener;
    doc.addEventListener = (...args: any[]) => {
      const eventName = args[0];
      const handler = args[1];
      if (eventName === "deviceready" && handler) {
        Promise.resolve().then(handler);
      } else if (eventName === "backbutton" && cap.Plugins.App) {
        // Add a dummy listener so Capacitor doesn't do the default
        // back button action
        cap.Plugins.App.addListener("backButton", () => {
          // ignore
        });
      }
      return docAddEventListener.apply(doc, args);
    };
  }

  // deprecated in v3, remove from v4
  cap.platform = cap.getPlatform();
  cap.isNative = cap.isNativePlatform();
};
export const initEvents = (win: any, cap: any): void => {
  const doc: Document = win.document;
  const cordova = win.cordova;

  cap.addListener = (pluginName, eventName, callback) => {
    const callbackId = cap.nativeCallback(
      pluginName,
      "addListener",
      {
        eventName: eventName,
      },
      callback
    );
    return {
      remove: async () => {
        win?.console?.debug("Removing listener", pluginName, eventName);
        cap.removeListener(pluginName, callbackId, eventName, callback);
      },
    };
  };

  cap.removeListener = (pluginName, callbackId, eventName, callback) => {
    cap.nativeCallback(
      pluginName,
      "removeListener",
      {
        callbackId: callbackId,
        eventName: eventName,
      },
      callback
    );
  };

  cap.createEvent = (eventName, eventData) => {
    if (doc) {
      const ev = doc.createEvent("Events");
      ev.initEvent(eventName, false, false);
      if (eventData && typeof eventData === "object") {
        for (const i in eventData) {
          // eslint-disable-next-line no-prototype-builtins
          if (eventData.hasOwnProperty(i)) {
            (ev as any)[i] = eventData[i];
          }
        }
      }
      return ev;
    }
    return null;
  };

  cap.triggerEvent = (eventName, target, eventData) => {
    eventData = eventData || {};
    const ev = cap.createEvent(eventName, eventData);

    if (ev) {
      if (target === "document") {
        if (cordova?.fireDocumentEvent) {
          cordova.fireDocumentEvent(eventName, eventData);
          return true;
        } else if (doc?.dispatchEvent) {
          return doc.dispatchEvent(ev);
        }
      } else if (target === "window" && win.dispatchEvent) {
        return (win as Window).dispatchEvent(ev);
      } else if (doc?.querySelector) {
        const targetEl: Element = doc.querySelector(target);
        if (targetEl) {
          return targetEl.dispatchEvent(ev);
        }
      }
    }
    return false;
  };
};
export const initBridge = (win: any, cap: any): void => {
  // keep a collection of callbacks for native response data
  const callbacks = new Map<string, any>();

  // Counter of callback ids, randomized to avoid
  // any issues during reloads if a call comes back with
  // an existing callback id from an old session
  let callbackIdCount = Math.floor(Math.random() * 134217728);

  let postToNative: (data: any) => void | null = null;

  // create the postToNative() fn if needed
  if (win.androidBridge) {
    // android platform
    postToNative = (data) => {
      try {
        win.androidBridge.postMessage(JSON.stringify(data));
      } catch (e) {
        win?.console?.error(e);
      }
    };
  } else if (win.webkit?.messageHandlers?.bridge) {
    // ios platform
    postToNative = (data) => {
      try {
        data.type = data.type ?? "message";
        win.webkit.messageHandlers.bridge.postMessage(data);
      } catch (e) {
        win?.console?.error(e);
      }
    };
  }

  cap.handleWindowError = (msg, url, lineNo, columnNo, err) => {
    const str = msg.toLowerCase();

    if (str.indexOf("script error") > -1) {
      // Some IE issue?
    } else {
      const errObj: any = {
        type: "js.error",
        error: {
          message: msg,
          url: url,
          line: lineNo,
          col: columnNo,
          errorObject: JSON.stringify(err),
        },
      };

      if (err !== null) {
        cap.handleError(err);
      }

      if (postToNative) {
        postToNative(errObj);
      }
    }

    return false;
  };

  if (cap.DEBUG) {
    window.onerror = cap.handleWindowError;
  }

  // initLogger(win, cap);

  /**
   * Send a plugin method call to the native layer
   */
  cap.toNative = (
    pluginName: string,
    methodName: string,
    options: any,
    storedCallback: any
  ) => {
    try {
      if (typeof postToNative === "function") {
        let callbackId = "-1";

        if (
          storedCallback &&
          (typeof storedCallback.callback === "function" ||
            typeof storedCallback.resolve === "function")
        ) {
          // store the call for later lookup
          callbackId = String(++callbackIdCount);
          callbacks.set(callbackId, storedCallback);
        }

        const callData: any = {
          callbackId: callbackId,
          pluginId: pluginName,
          methodName: methodName,
          options: options || {},
        };

        if (cap.DEBUG && pluginName !== "Console") {
          cap.logToNative(callData);
        }

        // post the call data to native
        postToNative(callData);

        return callbackId;
      } else {
        win?.console?.warn(`implementation unavailable for: ${pluginName}`);
      }
    } catch (e) {
      win?.console?.error(e);
    }

    return null;
  };

  /**
   * Process a response from the native layer.
   */
  cap.fromNative = (result: any) => {
    if (cap.DEBUG && result.pluginId !== "Console") {
      cap.logFromNative(result);
    }

    // get the stored call, if it exists
    try {
      const storedCall = callbacks.get(result.callbackId);

      if (storedCall) {
        // looks like we've got a stored call

        if (result.error) {
          // ensure stacktraces by copying error properties to an Error
          result.error = Object.keys(result.error).reduce((err, key) => {
            err[key] = (result.error as any)[key];
            return err;
          }, new cap.Exception("") as any);
        }

        if (typeof storedCall.callback === "function") {
          // callback
          if (result.success) {
            storedCall.callback(result.data);
          } else {
            storedCall.callback(null, result.error);
          }
        } else if (typeof storedCall.resolve === "function") {
          // promise
          if (result.success) {
            storedCall.resolve(result.data);
          } else {
            storedCall.reject(result.error);
          }

          // no need to keep this stored callback
          // around for a one time resolve promise
          callbacks.delete(result.callbackId);
        }
      } else if (!result.success && result.error) {
        // no stored callback, but if there was an error let's log it
        win?.console?.warn(result.error);
      }

      if (result.save === false) {
        callbacks.delete(result.callbackId);
      }
    } catch (e) {
      win?.console?.error(e);
    }

    // always delete to prevent memory leaks
    // overkill but we're not sure what apps will do with this data
    delete result.data;
    delete result.error;
  };

  if (typeof postToNative === "function") {
    // toNative bridge found
    cap.nativeCallback = (pluginName, methodName, options, callback) => {
      if (typeof options === "function") {
        console.warn(
          `Using a callback as the 'options' parameter of 'nativeCallback()' is deprecated.`
        );

        (callback as any) = options;
        (options as any) = null;
      }

      return cap.toNative(pluginName, methodName, options, { callback });
    };

    cap.nativePromise = (pluginName, methodName, options) => {
      return new Promise((resolve, reject) => {
        cap.toNative(pluginName, methodName, options, {
          resolve: resolve,
          reject: reject,
        });
      });
    };
  } else {
    // no native bridge created
    cap.nativeCallback = () => {
      throw new CapacitorException(
        `nativeCallback() not implemented`,
        ExceptionCode.Unimplemented
      );
    };
    cap.nativePromise = () =>
      Promise.reject(
        new CapacitorException(
          `nativePromise() not implemented`,
          ExceptionCode.Unimplemented
        )
      );
  }
};

export const convertFileSrcServerUrl = (
  webviewServerUrl: string,
  filePath: string
): string => {
  if (typeof filePath === "string") {
    if (filePath.startsWith("/")) {
      return webviewServerUrl + "/_capacitor_file_" + filePath;
    }
    if (filePath.startsWith("file://")) {
      return (
        webviewServerUrl + filePath.replace("file://", "/_capacitor_file_")
      );
    }
    if (filePath.startsWith("content://")) {
      return (
        webviewServerUrl + filePath.replace("content:/", "/_capacitor_content_")
      );
    }
  }
  return filePath;
};
export enum ExceptionCode {
  /**
   * API is not implemented.
   *
   * This usually means the API can't be used because it is not implemented for
   * the current platform.
   */
  Unimplemented = "UNIMPLEMENTED",

  /**
   * API is not available.
   *
   * This means the API can't be used right now because:
   *   - it is currently missing a prerequisite, such as network connectivity
   *   - it requires a particular platform or browser version
   */
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

  const webviewServerUrl =
    typeof win.WEBVIEW_SERVER_URL === "string" ? win.WEBVIEW_SERVER_URL : "";

  const getPlatform = () => {
    return "electron";
  };

  const isNativePlatform = () => {
    return true;
  };

  const isPluginAvailable = (pluginName: string): boolean => {
    const plugin = registeredPlugins.get(pluginName);

    if (plugin?.platforms.has(getPlatform())) {
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

  const convertFileSrc = (filePath: string) =>
    convertFileSrcServerUrl(webviewServerUrl, filePath);

  const logJs = (msg: string, level: "error" | "warn" | "info" | "log") => {
    switch (level) {
      case "error":
        win.console.error(msg);
        break;
      case "warn":
        win.console.warn(msg);
        break;
      case "info":
        win.console.info(msg);
        break;
      default:
        win.console.log(msg);
    }
  };

  const handleError = (err: Error) => win.console.error(err);

  const pluginMethodNoop = (
    _target: any,
    prop: PropertyKey,
    pluginName: string
  ) => {
    return Promise.reject(
      `${pluginName} does not have an implementation of "${prop as any}".`
    );
  };

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

  cap.convertFileSrc = convertFileSrc;
  cap.getPlatform = getPlatform;
  cap.getServerUrl = () => webviewServerUrl;
  cap.handleError = handleError;
  cap.isNativePlatform = isNativePlatform;
  cap.isPluginAvailable = isPluginAvailable;
  cap.logJs = logJs;
  cap.pluginMethodNoop = pluginMethodNoop;
  cap.registerPlugin = registerPlugin;
  cap.Exception = CapacitorException;
  cap.DEBUG = !!cap.DEBUG;
  cap.CUSTOM_PLATFORM = true;

  initBridge(win, cap);
  initEvents(win, cap);
  initVendor(win, cap);
  initLegacyHandlers(win, cap);

  return cap;
};
export const initCapacitorGlobal = (win: any): CapacitorGlobal =>
  (win.Capacitor = createCapacitorElectron(win));
export const Capacitor = /*#__PURE__*/ initCapacitorGlobal(
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
