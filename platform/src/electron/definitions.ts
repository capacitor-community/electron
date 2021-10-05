import type { CapacitorConfig } from '@capacitor/cli';

export interface SplashOptions {
  imageFilePath?: string;
  windowWidth?: number;
  windowHeight?: number;
}

export interface ElectronCapacitorDeeplinkingConfig {
  customProtocol: string;
  customHandler?: (url: string) => void;
}

export interface ElectronConfig {
  customUrlScheme?: string;
  trayIconAndMenuEnabled?: boolean;
  splashScreenEnabled?: boolean;
  splashScreenImageName?: string;
  hideMainWindowOnLaunch?: boolean;
  deepLinkingEnabled?: boolean;
  deepLinkingCustomProtocol?: string;
  backgroundColor?: string;
  appId?: string;
  appName?: string;
}

export type CapacitorElectronConfig = CapacitorConfig & {
  electron?: ElectronConfig;
};
