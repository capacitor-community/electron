import { app, BrowserWindow, Menu, MenuItem, nativeImage, Tray, session } from "electron";
import { join } from "path";
import chokidar from 'chokidar';
import electronIsDev from 'electron-is-dev';
import electronServe from 'electron-serve';
import unhandled from 'electron-unhandled';
import { autoUpdater } from "electron-updater"
import windowStateKeeper from 'electron-window-state';
import { CapElectronEventEmitter, CapacitorSplashScreen, getCapacitorConfig, setupElectronDeepLinking, setupCapacitorElectronPlugins } from "@capacitor-community/electron";
// const log = require('electron-log');

// Get Config options from capacitor.config 
const CapacitorFileConfig = getCapacitorConfig()

/////////////////////// Menus and Configs - Modify Freely //////////////////////////////////////////////
const TrayMenuTemplate = [
  new MenuItem({ label: "Quit App", role: "quit" })
];
const AppMenuBarMenuTemplate = [
  { role: process.platform === "darwin" ? "appMenu" : "fileMenu" },
  { role: "viewMenu" },
];
const DeepLinkingConfig = {customProtocol: CapacitorFileConfig.deepLinkingCustomProtocol ?? 'mycapacitorapp'};
////////////////////////////////////////////////////////////////////////////////////////////////////////

// -------------------------------------------------------------------------------------------------- //

/////////////////////// Capacitor Electron Internals Modify At Own risk ////////////////////////////////
let myCapacitorApp: ElectronCapacitorApp;
const reloadWatcher = {
  debouncer: null,
  ready: false,
  watcher: null,
};
function setupReloadWatcher() {
  reloadWatcher.watcher = chokidar.watch(join(app.getAppPath(), "app"), {
    ignored: /[/\\]\./,
    persistent: true
  }).on('ready', () => {
    reloadWatcher.ready = true;
  }).on('all', (_event, _path) => {
    if (reloadWatcher.ready) {
      clearTimeout(reloadWatcher.debouncer);
      reloadWatcher.debouncer = setTimeout(async () => {
        myCapacitorApp.getMainWindow().webContents.reload();
        reloadWatcher.ready = false;
        clearTimeout(reloadWatcher.debouncer);
        reloadWatcher.debouncer = null;
        reloadWatcher.watcher = null;
        setupReloadWatcher()
      }, 1500)
    }
  });
}
let mainWindowState = windowStateKeeper({defaultWidth: 1000, defaultHeight: 800});
const customScheme = CapacitorFileConfig.customUrlScheme ?? 'capacitor-electron';
unhandled();
class ElectronCapacitorApp {
  private MainWindow: BrowserWindow | null = null;
  private SplashScreen: CapacitorSplashScreen | null = null;
  private TrayIcon: Tray | null = null;
  private loadWebApp;
  
  constructor() {
    this.loadWebApp = electronServe({
      directory: join(app.getAppPath(), "app"),
      // The scheme can be changed to whatever you'd like (ex: someapp)
      scheme: customScheme,
    });

    if (electronIsDev) {
      setupReloadWatcher()
    }
  }

  private async loadMainWindow(thisRef: any) {
    await thisRef.loadWebApp(thisRef.MainWindow);
  }

  getMainWindow() {
    return this.MainWindow;
  }

  async init() {
    const preloadPath = join(app.getAppPath(), "build", "src", "preload.js");
    this.MainWindow = new BrowserWindow({
      show: false,
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        // Use preload to inject the electron varriant overrides for capacitor plugins.
        // preload: join(app.getAppPath(), "node_modules", "@capacitor-community", "electron", "dist", "runtime", "electron-rt.js"),
        preload: preloadPath,
      },
    });

    mainWindowState.manage(this.MainWindow);

    this.MainWindow.on("closed", () => {
      if (this.SplashScreen && this.SplashScreen.getSplashWindow() && !this.SplashScreen.getSplashWindow().isDestroyed()) {
        this.SplashScreen.getSplashWindow().close();
      }
    });

    if (CapacitorFileConfig.trayIconAndMenuEnabled) {
      this.TrayIcon = new Tray(nativeImage.createFromPath(join(app.getAppPath(), 'assets', process.platform === "win32" ? "appIcon.ico" : "appIcon.png")));
      this.TrayIcon.on("double-click", () => {
        if (this.MainWindow) {
          if (this.MainWindow.isVisible()) {
            this.MainWindow.hide();
          } else {
            this.MainWindow.show();
            this.MainWindow.focus();
          }
        }
      });
      this.TrayIcon.on("click", () => {
        if (this.MainWindow) {
          if (this.MainWindow.isVisible()) {
            this.MainWindow.hide();
          } else {
            this.MainWindow.show();
            this.MainWindow.focus();
          }
        }
      });
      this.TrayIcon.setToolTip(app.getName());
      this.TrayIcon.setContextMenu(
        Menu.buildFromTemplate(TrayMenuTemplate)
      );
    }

    // Setup app windows menu bar
    Menu.setApplicationMenu(
      // @ts-ignore
      Menu.buildFromTemplate(AppMenuBarMenuTemplate)
    );

    if (CapacitorFileConfig.splashScreenEnabled) {
      this.SplashScreen = new CapacitorSplashScreen({
        imageFilePath: join(app.getAppPath(), "assets", CapacitorFileConfig.splashScreenImageName ?? "splash.png"),
        windowWidth: 400,
        windowHeight: 400,
      });
      this.SplashScreen.init(this.loadMainWindow, this);
    } else {
      this.loadMainWindow(this);
    }

    // Security
    this.MainWindow.webContents.setWindowOpenHandler((details) => {
      if (!details.url.includes(customScheme)) {
        return {action: 'deny'}
      } else {
        return {action: 'allow'}
      }
    })
    this.MainWindow.webContents.on('will-navigate', (event, newURL) => {
      if (!this.MainWindow.webContents.getURL().includes(customScheme)) {
        event.preventDefault();
      }
    })

    // Link electron plugins in
    setupCapacitorElectronPlugins()

    this.MainWindow.webContents.on("dom-ready", () => {
      if (CapacitorFileConfig.splashScreenEnabled) {
        this.SplashScreen.getSplashWindow().hide();
      }
      if (!CapacitorFileConfig.hideMainWindowOnLaunch) {
        this.MainWindow.show();
      }
      setTimeout(() => {
        if (electronIsDev) {
          this.MainWindow.webContents.openDevTools();
        }
        CapElectronEventEmitter.emit("CAPELECTRON_DeeplinkListenerInitialized", "");
      }, 400);
    });
  }

}
myCapacitorApp = new ElectronCapacitorApp();
if (CapacitorFileConfig.deepLinkingEnabled) {
  setupElectronDeepLinking(myCapacitorApp, DeepLinkingConfig);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////

// Run Application
(async () => {
  await app.whenReady();
  // Security
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          electronIsDev ? 
            `default-src ${customScheme}://* 'unsafe-inline' devtools://* 'unsafe-eval' data:` : 
            `default-src ${customScheme}://* 'unsafe-inline' data:`
        ]
      }
    })
  })
  await myCapacitorApp.init()
  autoUpdater.checkForUpdatesAndNotify()
})();

app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", async function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (myCapacitorApp.getMainWindow().isDestroyed()) { 
    await myCapacitorApp.init();
  }
});

// Place all ipc or other electron api calls and custom functionality under this line
