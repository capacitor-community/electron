import {
  CapacitorElectronConfig,
  ElectronCapacitorDeeplinkingConfig,
} from "./interfaces";
import { CapacitorSplashScreen } from "./ElectronSplashScreen";
import Electron from "electron";
import { configCapacitor, deepMerge } from "./Utils";

const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;
const nativeImage = electron.nativeImage;
const Tray = electron.Tray;
const ipcMain = electron.ipcMain;
const fs = require("fs");
const path = require("path");
const electronIsDev = require("electron-is-dev");
const electronServe = require("electron-serve");

const EventEmitter = require("events");
class CapElectronEmitter extends EventEmitter {}
const theEmitter = new CapElectronEmitter();

const loadWebApp = electronServe({
  directory: path.join(app.getAppPath(), "app"),
  scheme: "capacitor-electron",
});

export class CapacitorElectronApp {
  private mainWindowReference: Electron.BrowserWindow | null = null;
  private splashScreenReference: CapacitorSplashScreen | null = null;
  private trayIcon: Electron.Tray | null = null;
  // @ts-ignore
  private devServerUrl: string | null = null;
  private config: CapacitorElectronConfig = {
    trayMenu: {
      useTrayMenu: false,
      trayIconPath: path.join(
        app.getAppPath(),
        "assets",
        process.platform === "win32" ? "appIcon.ico" : "appIcon.png"
      ),
      trayContextMenu: [new MenuItem({ label: "Quit App", role: "quit" })],
    },
    splashScreen: {
      useSplashScreen: true,
      splashOptions: {
        imageFilePath: path.join(app.getAppPath(), "assets", "splash.png"),
        windowWidth: 400,
        windowHeight: 400,
      },
    },
    applicationMenuTemplate: [
      { role: process.platform === "darwin" ? "appMenu" : "fileMenu" },
      { role: "viewMenu" },
    ],
    mainWindow: {
      windowOptions: {
        show: null,
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
  private userPassedConfig: CapacitorElectronConfig | null = null;

  constructor(config?: CapacitorElectronConfig) {
    if (config) this.userPassedConfig = config;
  }

  /** Creates mainwindow and does all setup. _Called after app.on('ready') event fired._ */
  async init() {
    let capConfig: any = {} 
    if (fs.existsSync(path.join(app.getAppPath(), "capacitor.config.ts"))) {
      capConfig = await import(path.join(app.getAppPath(), "capacitor.config.ts"))
    } else if (fs.existsSync(path.join(app.getAppPath(), "capacitor.config.js"))) {
      capConfig = require(path.join(app.getAppPath(), "capacitor.config.js"))
    } else {
      capConfig = JSON.parse(fs.readFileSync(path.join(app.getAppPath(), "capacitor.config.json")).toString());
    }
    if (capConfig.electron) this.config = deepMerge(this.config, [capConfig.electron]);
    if (this.userPassedConfig) this.config = deepMerge(this.config, [this.userPassedConfig]);

    // console.log(this.config.mainWindow.windowOptions);
    const rtPath = path.join(
      app.getAppPath(),
      "node_modules",
      "@capacitor-community",
      "electron",
      "dist",
      "runtime",
      "electron-rt.js"
    )

    const neededBrowserWindowConfig = {
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        // Use preload to inject the electron varriant overrides for capacitor plugins.
        // Note: any windows you spawn that you want to include capacitor plugins must have this preload.
        preload: rtPath
      },
    };

    this.mainWindowReference = new BrowserWindow(
      deepMerge({ ...this.config.mainWindow.windowOptions }, [
        neededBrowserWindowConfig,
      ])
    );


    this.mainWindowReference.on("closed", () => {
      if (
        this.splashScreenReference &&
        this.splashScreenReference.getSplashWindow() &&
        !this.splashScreenReference.getSplashWindow().isDestroyed()
      ) {
        this.splashScreenReference.getSplashWindow().close();
      }
    });

    // console.log(this.config.mainWindow.windowOptions);

    //  set trayIcon if is true in capacitor.config.json
    if (this.config.trayMenu && this.config.trayMenu.useTrayMenu) {
      this.trayIcon = new Tray(
        nativeImage.createFromPath(this.config.trayMenu.trayIconPath)
      );
      this.trayIcon.on("double-click", this.toggleMainWindow);
      this.trayIcon.on("click", () => {
        this.toggleMainWindow();
      });

      this.trayIcon.setToolTip(app.getName());

      if (this.config.trayMenu.trayContextMenu) {
        this.trayIcon.setContextMenu(
          Menu.buildFromTemplate(this.config.trayMenu.trayContextMenu)
        );
      }
    }

    configCapacitor(this.mainWindowReference, this.config);

    if (this.config.applicationMenuTemplate !== null) {
      Menu.setApplicationMenu(
        Menu.buildFromTemplate(this.config.applicationMenuTemplate)
      );
    } else {
      Menu.setApplicationMenu(null);
    }

    // Based on Splashscreen choice actually load the window.
    if (this.config.splashScreen.useSplashScreen) {
      this.splashScreenReference = new CapacitorSplashScreen(
        this.config.splashScreen.splashOptions
      );
      this.splashScreenReference.init(this.loadMainWindow, this);
    } else {
      this.loadMainWindow(this);
    }

    //setupListeners
    const rtPluginsPath = path.join(
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
      for (const classKey of Object.keys(plugins[pluginKey])) {
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
              const isPromise = theCall instanceof Promise || (theCall instanceof AsyncFunction)
              console.log('isPromise')
              console.log(isPromise)
              let returnVal = null
              if (isPromise) {
                returnVal = await theCall(...args)
                event.reply(`${classKey}-${functionName}-reply`, returnVal || null)
              } else {
                returnVal = theCall(...args)
                event.returnValue = returnVal
              }
            })
          }
        }
      }
    }

    this.mainWindowReference.webContents.on("dom-ready", () => {
      if (this.config.splashScreen.useSplashScreen) {
        this.splashScreenReference.getSplashWindow().hide();
      }
      if (
        this.config.mainWindow.windowOptions.show === null ||
        this.config.mainWindow.windowOptions.show === true
      ) {
        this.mainWindowReference.show();
      }
      setTimeout(() => {
        if (electronIsDev) {
          this.mainWindowReference.webContents.openDevTools();
        }
        theEmitter.emit("CAPELECTRON_DeeplinkListenerInitialized", "");
      }, 400);
    });
  }

  private async loadMainWindow(thisRef: any) {
    if (thisRef.devServerUrl !== null) {
      await thisRef.mainWindowReference.webContents.loadURL(
        thisRef.devServerUrl
      );
    } else {
      await loadWebApp(thisRef.mainWindowReference);
    }
  }

  toggleMainWindow() {
    if (this.mainWindowReference) {
      if (this.mainWindowReference.isVisible()) {
        this.mainWindowReference.hide();
      } else {
        this.showMainWindow();
      }
    }
  }

  private showMainWindow() {
    if (this.mainWindowReference) {
      this.mainWindowReference.show();
      this.mainWindowReference.focus();
    }
  }

  toggleSplashscreenWindow() {
    if (this.splashScreenReference) {
      if (this.splashScreenReference.getSplashWindow().isVisible()) {
        this.splashScreenReference.getSplashWindow().hide();
      } else {
        this.showSplashscreenWindow();
      }
    }
  }

  private showSplashscreenWindow() {
    if (this.splashScreenReference) {
      this.splashScreenReference.getSplashWindow().show();
      this.splashScreenReference.getSplashWindow().focus();
    }
  }

  getSplashscreenWindow() {
    return this.splashScreenReference.getSplashWindow();
  }

  getMainWindow() {
    return this.mainWindowReference;
  }

  getTrayIcon() {
    return this.trayIcon;
  }
}

export class ElectronCapacitorDeeplinking {
  private customProtocol: string = "mycapacitorapp";
  private lastPassedUrl: null | string = null;
  private customHandler: (url: string) => void | null = null;
  private capacitorAppRef: any = null;

  constructor(capacitorApp: any, config: ElectronCapacitorDeeplinkingConfig) {
    this.capacitorAppRef = capacitorApp;
    this.customProtocol = config.customProtocol;
    if (config.customHandler) this.customHandler = config.customHandler;

    theEmitter.on("CAPELECTRON_DeeplinkListenerInitialized", () => {
      if (
        this.capacitorAppRef !== null &&
        this.capacitorAppRef.getMainWindow() &&
        !this.capacitorAppRef.getMainWindow().isDestroyed() &&
        this.lastPassedUrl !== null &&
        this.lastPassedUrl.length > 0
      )
        this.capacitorAppRef
          .getMainWindow()
          .webContents.send("appUrlOpen", this.lastPassedUrl);
      this.lastPassedUrl = null;
    });

    const instanceLock = app.requestSingleInstanceLock();
    if (instanceLock) {
      app.on("second-instance", (_event, argv) => {
        if (process.platform == "win32") {
          this.lastPassedUrl = argv.slice(1).toString();
          this.internalHandler(this.lastPassedUrl);
        }
        if (!this.capacitorAppRef.getMainWindow().isDestroyed()) {
          if (this.capacitorAppRef.getMainWindow().isMinimized())
            this.capacitorAppRef.getMainWindow().restore();
          this.capacitorAppRef.getMainWindow().focus();
        } else {
          this.capacitorAppRef.init();
        }
      });
    } else {
      app.quit();
    }

    if (!app.isDefaultProtocolClient(this.customProtocol))
      app.setAsDefaultProtocolClient(this.customProtocol);
    app.on("open-url", (event, url) => {
      event.preventDefault();
      this.lastPassedUrl = url;
      this.internalHandler(url);
      if (
        this.capacitorAppRef &&
        this.capacitorAppRef.getMainWindow() &&
        this.capacitorAppRef.getMainWindow().isDestroyed()
      )
        this.capacitorAppRef.init();
    });

    if (process.platform == "win32") {
      this.lastPassedUrl = process.argv.slice(1).toString();
      this.internalHandler(this.lastPassedUrl);
    }
  }

  private internalHandler(urlLink: string | null) {
    if (urlLink !== null && urlLink.length > 0) {
      const paramsArr = urlLink.split(",");
      let url = "";
      for (let item of paramsArr) {
        if (item.indexOf(this.customProtocol) >= 0) {
          url = item;
          break;
        }
      }
      if (url.length > 0) {
        if (this.customHandler !== null && url !== null)
          this.customHandler(url);
        if (
          this.capacitorAppRef !== null &&
          this.capacitorAppRef.getMainWindow() &&
          !this.capacitorAppRef.getMainWindow().isDestroyed()
        )
          this.capacitorAppRef
            .getMainWindow()
            .webContents.send("appUrlOpen", url);
      }
    }
  }
}
