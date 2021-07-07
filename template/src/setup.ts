import chokidar from "chokidar";
import electronServe from "electron-serve";
import electronIsDev from "electron-is-dev";
import windowStateKeeper from "electron-window-state";
import {
  CapElectronEventEmitter,
  CapacitorSplashScreen,
  getCapacitorConfig,
  setupElectronDeepLinking,
  setupCapacitorElectronPlugins,
} from "@capacitor-community/electron";
import {
  app,
  BrowserWindow,
  Menu,
  MenuItem,
  MenuItemConstructorOptions,
  nativeImage,
  Tray,
  session,
} from "electron";
import { join } from "path";

// Get Config options from capacitor.config
const CapacitorFileConfig = getCapacitorConfig();

//---Menus and Configs - Modify Freely---//
const TrayMenuTemplate = [new MenuItem({ label: "Quit App", role: "quit" })];
const AppMenuBarMenuTemplate: (MenuItem | MenuItemConstructorOptions)[] = [
  { role: process.platform === "darwin" ? "appMenu" : "fileMenu" },
  { role: "viewMenu" },
];
const DeepLinkingConfig = {
  customProtocol:
    CapacitorFileConfig.deepLinkingCustomProtocol ?? "mycapacitorapp",
};

//---Capacitor Electron Internals - Modify At Your Own risk---//
// Define our app holder.
let myCapacitorApp: ElectronCapacitorApp;
// Define components for a watcher to detect when the webapp is changed so we can reload in Dev mode.
const reloadWatcher = {
  debouncer: null,
  ready: false,
  watcher: null,
};
function setupReloadWatcher() {
  reloadWatcher.watcher = chokidar
    .watch(join(app.getAppPath(), "app"), {
      ignored: /[/\\]\./,
      persistent: true,
    })
    .on("ready", () => {
      reloadWatcher.ready = true;
    })
    .on("all", (_event, _path) => {
      if (reloadWatcher.ready) {
        clearTimeout(reloadWatcher.debouncer);
        reloadWatcher.debouncer = setTimeout(async () => {
          myCapacitorApp.getMainWindow().webContents.reload();
          reloadWatcher.ready = false;
          clearTimeout(reloadWatcher.debouncer);
          reloadWatcher.debouncer = null;
          reloadWatcher.watcher = null;
          setupReloadWatcher();
        }, 1500);
      }
    });
}
// Set our custom scheme for our web app or default to 'capacitor-electron://......'
const customScheme =
  CapacitorFileConfig.customUrlScheme ?? "capacitor-electron";
// Setup window state management, this allows windows to persist their positions between runs.
let mainWindowState = windowStateKeeper({
  defaultWidth: 1000,
  defaultHeight: 800,
});
// Define our class to manage our app.
class ElectronCapacitorApp {
  private MainWindow: BrowserWindow | null = null;
  private SplashScreen: CapacitorSplashScreen | null = null;
  private TrayIcon: Tray | null = null;
  private loadWebApp;

  constructor() {
    // Setup our web app loader, this lets us load apps like react, vue, and angular without changing their build chains.
    this.loadWebApp = electronServe({
      directory: join(app.getAppPath(), "app"),
      scheme: customScheme,
    });

    // If we are in Dev mode, use the file watcher components.
    if (electronIsDev) {
      setupReloadWatcher();
    }
  }

  // Helper function to load in the app.
  private async loadMainWindow(thisRef: any) {
    await thisRef.loadWebApp(thisRef.MainWindow);
  }

  // Expose the mainWindow ref for use outside of the class.
  getMainWindow() {
    return this.MainWindow;
  }

  async init() {
    // Setup preload script path and construct our main window.
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

    // If we close the main window with the spalshscreen enabled we need to destory the ref.
    this.MainWindow.on("closed", () => {
      if (
        this.SplashScreen &&
        this.SplashScreen.getSplashWindow() &&
        !this.SplashScreen.getSplashWindow().isDestroyed()
      ) {
        this.SplashScreen.getSplashWindow().close();
      }
    });

    // When the tray icon is enabled, setup the options.
    if (CapacitorFileConfig.trayIconAndMenuEnabled) {
      this.TrayIcon = new Tray(
        nativeImage.createFromPath(
          join(
            app.getAppPath(),
            "assets",
            process.platform === "win32" ? "appIcon.ico" : "appIcon.png"
          )
        )
      );
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
      this.TrayIcon.setContextMenu(Menu.buildFromTemplate(TrayMenuTemplate));
    }

    // Setup the main manu bar at the top of our window.
    Menu.setApplicationMenu(Menu.buildFromTemplate(AppMenuBarMenuTemplate));

    // If the splashscreen is enabled, show it first while the main window loads then dwitch it out for the main window, or just load the main window from the start.
    if (CapacitorFileConfig.splashScreenEnabled) {
      this.SplashScreen = new CapacitorSplashScreen({
        imageFilePath: join(
          app.getAppPath(),
          "assets",
          CapacitorFileConfig.splashScreenImageName ?? "splash.png"
        ),
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
        return { action: "deny" };
      } else {
        return { action: "allow" };
      }
    });
    this.MainWindow.webContents.on("will-navigate", (event, newURL) => {
      if (!this.MainWindow.webContents.getURL().includes(customScheme)) {
        event.preventDefault();
      }
    });

    // Link electron plugins into the system.
    setupCapacitorElectronPlugins();

    // When the web app is loaded we hide the splashscreen if needed and show the mainwindow.
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
        CapElectronEventEmitter.emit(
          "CAPELECTRON_DeeplinkListenerInitialized",
          ""
        );
      }, 400);
    });
  }
}
// Initialize our app.
myCapacitorApp = new ElectronCapacitorApp();
// If deeplinking is enabled then we will set it up here.
if (CapacitorFileConfig.deepLinkingEnabled) {
  setupElectronDeepLinking(myCapacitorApp, DeepLinkingConfig);
}
//-----------------------------------------------------------//

export function setupContentSecurityPolicy() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          electronIsDev
            ? `default-src ${customScheme}://* 'unsafe-inline' devtools://* 'unsafe-eval' data:`
            : `default-src ${customScheme}://* 'unsafe-inline' data:`,
        ],
      },
    });
  });
}

export const electronCapacitorApp = myCapacitorApp;
