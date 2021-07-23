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
