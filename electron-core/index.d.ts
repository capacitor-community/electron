/** @hidden */
import Electron from "electron";
export interface CapacitorElectronConfig {
  splashScreen?: {
    /** Whether or not to show a splash screen on startup. __Default is: true__ */
    useSplashScreen?: boolean;
    splashOptions?: {
      /** Where the splash screen image is located. __Default is:__ `path.join(app.getAppPath(), "assets", "splash.png")` */
      imageFilePath?: string;
      /** Window width in px. __Default is: 400__ */
      windowWidth?: number;
      /** Window height in px. __Default is: 400__ */
      windowHeight?: number;
      textColor?: string;
      loadingText?: string;
      textPercentageFromTop?: number;
      transparentWindow?: boolean;
      /** Whether or not to auto hide a splash screen or if the app will hide it. __Default is: true__ */
      autoHideLaunchSplash?: boolean;
      customHtml?: string | null;
    };
  };
  /** Define your applications native menu bar. Set to _null_ if you want to hide the bar. __Default is:__
   * ```
   *   [
   *     {role: process.platform === "darwin" ? 'appMenu' : 'fileMenu'},
   *     { role: "viewMenu" }
   *   ]
   * ```
   */
  applicationMenuTemplate?:
    | {
        [key: string]: any;
      }[]
    | null;
  mainWindow?: {
    windowOptions?: {
      /** Start height of the main application window in px. __Default is: 920__ */
      height?: number;
      /** Start width of the main application window in px. __Default is: 1600__ */
      width?: number;
      /** Path of the icon file for the main window. __Default is:__ `path.join(app.getAppPath(), "assets", process.platform === "win32" ? "appIcon.ico" : "appIcon.png")` */
      icon?: string;
    };
  };
  deepLinking?: {
    /** Whether or not deeplinking should be enabled on the url provided in `capacitor.config.json -> server -> hostname` (`'app'` is used if hostname is undefined). __Default is: false__ */
    useDeeplinking: boolean;
    /** Optional handler to deal with deeplink urls in the main process of electron. __Default is: null__ */
    deeplinkingHandlerFunction?: (deeplinkingUrl: string) => void | null;
  };
}
export declare class CapacitorElectronApp {
  /** @internal */
  private isProgramColdStart;
  /** @internal */
  private deepLinking;
  /** @internal */
  private deeplinkingCustomProtocol;
  /** @internal */
  private devServerUrl;
  /** @internal */
  private capConfigLaunchShowDuration;
  /** @internal */
  private config;
  constructor(config?: CapacitorElectronConfig);
  /** Creates mainwindow and does all setup. _Called after app.on('ready') event fired._ */
  init(): void;
  /** @internal */
  private loadMainWindow;
  getMainWindow(): Electron.BrowserWindow;
}
