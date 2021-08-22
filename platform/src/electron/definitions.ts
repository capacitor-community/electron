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
<<<<<<< HEAD:platform/src/electron/definitions.ts
=======
}

export interface CapacitorElectronExtendedConfig extends CapacitorElectronConfig {
>>>>>>> main:src/electron/definitions.ts
  backgroundColor?: string;
  appId?: string;
  appName?: string;
}

<<<<<<< HEAD:platform/src/electron/definitions.ts
export type CapacitorElectronConfig = CapacitorConfig & {
  electron?: ElectronConfig;
};
=======
export type ElectronCapacitorConfig = CapacitorConfig & { electron: CapacitorElectronConfig }
>>>>>>> main:src/electron/definitions.ts
