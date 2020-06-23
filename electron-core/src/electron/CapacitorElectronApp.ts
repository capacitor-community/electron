/** @hidden */
import { CapacitorElectronConfig } from "./interfaces";
/** @hidden */
import { CapacitorSplashScreen } from "./ElectronSplashScreen";
/** @hidden */
import { CapacitorDeeplinking } from "./ElectronDeepLinking";
/** @hidden */
import Electron from "electron";
/** @hidden */
const electron = require("electron");
/** @hidden */
const app = electron.app;
/** @hidden */
const BrowserWindow = electron.BrowserWindow;
/** @hidden */
const Menu = electron.Menu;
/** @hidden */
const path = require("path");
/** @hidden */
const fs = require("fs");
/** @hidden */
const electronIsDev = require("electron-is-dev");
/** @internal */
function deepMerge(target: any, _objects: any[] = []) {
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
/** @internal */
async function configCapacitor(mainWindow: Electron.BrowserWindow) {
  let capConfigJson = JSON.parse(
    fs.readFileSync(`./capacitor.config.json`, "utf-8")
  );
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
/** @hidden */
const electronServe = require("electron-serve");
/** @hidden */
const loadWebApp = electronServe({
  directory: path.join(app.getAppPath(), "app"),
  scheme: "capacitor-electron",
});

export class CapacitorElectronApp {
  /** @internal */
  private mainWindowReference: Electron.BrowserWindow | null = null;
  /** @internal */
  private splashScreenReference: CapacitorSplashScreen | null = null;

  /** @internal */
  private isProgramColdStart = true;
  /** @internal */
  private deepLinking: any = null;
  /** @internal */
  private deeplinkingCustomProtocol: "app";
  /** @internal */
  private devServerUrl: string | null = null;
  /** @internal */
  private capConfigLaunchShowDuration = 1;
  /** @internal */
  private config: CapacitorElectronConfig = {
    deepLinking: {
      useDeeplinking: false,
      deeplinkingHandlerFunction: null,
    },
    splashScreen: {
      useSplashScreen: true,
      splashOptions: {
        imageFilePath: path.join(app.getAppPath(), "assets", "splash.png"),
        windowWidth: 400,
        windowHeight: 400,
        textColor: "#FFFFFF",
        loadingText: "Loading...",
        textPercentageFromTop: 75,
        transparentWindow: false,
        autoHideLaunchSplash: true,
        customHtml: null,
      },
    },
    applicationMenuTemplate: [
      { role: process.platform === "darwin" ? "appMenu" : "fileMenu" },
      { role: "viewMenu" },
    ],
    mainWindow: {
      windowOptions: {
        height: 920,
        width: 1600,
        icon: path.join(
          app.getAppPath(),
          "assets",
          process.platform === "win32" ? "appIcon.ico" : "appIcon.png"
        ),
      },
    },
  };

  constructor(config?: CapacitorElectronConfig) {
    if (config) this.config = deepMerge(this.config, [config]);

    const capConfigPath = path.join(app.getAppPath(), "capacitor.config.json");
    if (fs.existsSync(capConfigPath)) {
      const capConfig = JSON.parse(fs.readFileSync(capConfigPath, "utf-8"));
      if (
        capConfig.plugins &&
        capConfig.plugins.SplashScreen &&
        capConfig.plugins.SplashScreen.launchShowDuration
      ) {
        this.capConfigLaunchShowDuration =
          capConfig.plugins.SplashScreen.launchShowDuration;
      }
      if (capConfig.server && capConfig.server.url) {
        this.devServerUrl = capConfig.server.url;
      }
      if (this.config.deepLinking.useDeeplinking) {
        if (capConfig.server && capConfig.server.hostname) {
          this.deeplinkingCustomProtocol = capConfig.server.hostname;
        }
        console.log(
          `[Capacitor]: Set deeplinking url to: ${this.deeplinkingCustomProtocol}`
        );
      }
    }
  }

  /** Creates mainwindow and does all setup. _Called after app.on('ready') event fired._ */
  init() {
    const neededBrowserWindowConfig = {
      show: false,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        // Use preload to inject the electron varriant overrides for capacitor plugins.
        // Note: any windows you spawn that you want to include capacitor plugins must have this preload.
        preload: path.join(app.getAppPath(), "preloader.js"),
      },
    };

    this.mainWindowReference = new BrowserWindow(
      Object.assign(
        this.config.mainWindow.windowOptions,
        neededBrowserWindowConfig
      )
    );

    if (this.config.deepLinking.useDeeplinking)
      this.deepLinking = new CapacitorDeeplinking(this.mainWindowReference, {
        customProtocol: this.deeplinkingCustomProtocol,
      });

    configCapacitor(this.mainWindowReference);

    if (electronIsDev && this.config.applicationMenuTemplate !== null) {
      // Set our above template to the Menu Object if we are in development mode, dont want users having the devtools.
      Menu.setApplicationMenu(
        Menu.buildFromTemplate(this.config.applicationMenuTemplate)
      );
    }

    this.mainWindowReference.webContents.on("dom-ready", () => {
      if (
        this.config.splashScreen.useSplashScreen &&
        this.config.splashScreen.splashOptions.autoHideLaunchSplash
      ) {
        this.splashScreenReference.hide();
      } else {
        this.mainWindowReference.show();
      }
      // If we are developers we might as well open the devtools by default.
      if (electronIsDev) {
        setTimeout(() => {
          this.mainWindowReference.webContents.openDevTools();
        }, 200);
      }
    });

    // Setup the handler for deeplinking if it has been setup.
    if (this.deepLinking !== null) {
      if (this.config.deepLinking.deeplinkingHandlerFunction !== null) {
        this.deepLinking.init(
          this.config.deepLinking.deeplinkingHandlerFunction
        );
      } else {
        this.deepLinking.init();
      }
    }

    // Based on Splashscreen choice actually load the window.
    if (this.config.splashScreen.useSplashScreen) {
      this.splashScreenReference = new CapacitorSplashScreen(
        this.mainWindowReference,
        this.config.splashScreen.splashOptions
      );
      this.splashScreenReference.init();
      setTimeout(() => {
        this.loadMainWindow();
      }, this.capConfigLaunchShowDuration);
    } else {
      this.loadMainWindow();
    }
  }

  /** @internal */
  private async loadMainWindow() {
    if (this.devServerUrl !== null) {
      await this.mainWindowReference.webContents.loadURL(this.devServerUrl);
    } else {
      await loadWebApp(this.mainWindowReference);
    }
    if (this.deepLinking !== null && this.isProgramColdStart) {
      if (this.deepLinking.getPassedDeeplinkUrl().length > 0) {
        this.isProgramColdStart = false;
        // Pass deeplink if there was one, to webapp after it has loaded on first launch
        setTimeout(() => {
          this.mainWindowReference.webContents.send(
            "appUrlOpen",
            this.deepLinking.getPassedDeeplinkUrl()
          );
        }, 500);
      }
    }
  }

  getMainWindow() {
    return this.mainWindowReference;
  }
}
