/** @hidden */
import { CapacitorElectronConfig } from "./interfaces";
/** @hidden */
import { CapacitorSplashScreen } from "./ElectronSplashScreen";
/** @hidden */
import { CapacitorDeeplinking } from "./ElectronDeepLinking";
/** @hidden */
import Electron from "electron";
/** @hidden */
import { configCapacitor, deepMerge } from "./Utils";
/** @hidden */
const electron = require("electron");
/** @hidden */
const app = electron.app;
/** @hidden */
const BrowserWindow = electron.BrowserWindow;
/** @hidden */
const Menu = electron.Menu;
/** @hidden */
const MenuItem = electron.MenuItem;
/** @hidden */
const nativeImage = electron.nativeImage;
/** @hidden */
const Tray = electron.Tray;
/** @hidden */
const path = require("path");
/** @hidden */
const fs = require("fs");
/** @hidden */
const electronIsDev = require("electron-is-dev");
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
  private trayIcon: Electron.Tray | null = null; // @ts-ignore

  /** @internal */ private isProgramColdStart = true;
  /** @internal */
  private deepLinking: any = null;
  /** @internal */
  private deeplinkingCustomProtocol: "app"; // @ts-ignore
  /** @internal */ private devServerUrl: string | null = null;
  /** @internal */
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

  constructor(config?: CapacitorElectronConfig) {
    if (config) this.config = deepMerge(this.config, [config]);

    const capConfigPath = path.join(app.getAppPath(), "capacitor.config.json");
    if (fs.existsSync(capConfigPath)) {
      const capConfig = JSON.parse(fs.readFileSync(capConfigPath, "utf-8"));
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
    console.log(this.config.mainWindow.windowOptions);

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
      deepMerge({ ...this.config.mainWindow.windowOptions }, [
        neededBrowserWindowConfig,
      ])
    );

    this.mainWindowReference.on("closed", () => {
      if (
        this.splashScreenReference.getSplashWindow() &&
        !this.splashScreenReference.getSplashWindow().isDestroyed()
      ) {
        this.splashScreenReference.getSplashWindow().close();
      }
    });

    console.log(this.config.mainWindow.windowOptions);

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
        this.config.splashScreen.splashOptions
      );
      this.splashScreenReference.init(this.loadMainWindow, this);
    } else {
      this.loadMainWindow(this);
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
      // If we are developers we might as well open the devtools by default.
      if (electronIsDev) {
        setTimeout(() => {
          this.mainWindowReference.webContents.openDevTools();
        }, 200);
      }
    });
  }

  /** @internal */
  private async loadMainWindow(thisRef: any) {
    if (thisRef.devServerUrl !== null) {
      await thisRef.mainWindowReference.webContents.loadURL(
        thisRef.devServerUrl
      );
    } else {
      await loadWebApp(thisRef.mainWindowReference);
    }
    if (thisRef.deepLinking !== null && thisRef.isProgramColdStart) {
      if (thisRef.deepLinking.getPassedDeeplinkUrl().length > 0) {
        thisRef.isProgramColdStart = false;
        // Pass deeplink if there was one, to webapp after it has loaded on first launch
        setTimeout(() => {
          thisRef.mainWindowReference.webContents.send(
            "appUrlOpen",
            thisRef.deepLinking.getPassedDeeplinkUrl()
          );
        }, 500);
      }
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
