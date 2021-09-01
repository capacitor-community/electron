import { CapacitorConfig } from "@capacitor/cli";
export interface SplashOptions {
    imageFilePath?: string;
    windowWidth?: number;
    windowHeight?: number;
}
export interface ElectronCapacitorDeeplinkingConfig {
    customProtocol: string;
    customHandler?: (url: string) => void;
}
export interface CapacitorElectronConfig {
    customUrlScheme?: string;
    trayIconAndMenuEnabled?: boolean;
    splashScreenEnabled?: boolean;
    splashScreenImageName?: string;
    hideMainWindowOnLaunch?: boolean;
    deepLinkingEnabled?: boolean;
    deepLinkingCustomProtocol?: string;
}
export interface CapacitorElectronExtendedConfig extends CapacitorElectronConfig {
    backgroundColor?: string;
    appId?: string;
    appName?: string;
}
export declare type ElectronCapacitorConfig = CapacitorConfig & {
    electron: CapacitorElectronConfig;
};
