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
  hideMainWindowOnLaunch?: boolean;
  deepLinkingEnabled?: boolean;
}