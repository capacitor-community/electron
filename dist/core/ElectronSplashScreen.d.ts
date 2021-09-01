import Electron from "electron";
import { SplashOptions } from "./definitions";
export declare class CapacitorSplashScreen {
    private splashWin;
    private splashOptions;
    constructor(splashOptions?: SplashOptions);
    init(loadMainWindowCallback: any, mainWindowThisRef: any): Promise<void>;
    getSplashWindow(): Electron.BrowserWindow;
}
