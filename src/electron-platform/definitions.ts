import type { CapacitorConfig } from '@capacitor/cli';
import type { WebContents, WebFrameMain, IpcMainInvokeEvent } from 'electron';

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

export type PluginContext = {
  caller: { readonly get: () => CallContext };
};

export type CallContext = {
  /** The internal ID of the renderer process that sent this message */
  processId: number;
  /** The ID of the renderer frame that sent this message */
  frameId: number;
  /** Returns the `webContents` that sent the message */
  sender: WebContents;
  /** The frame that sent this message */
  senderFrame: WebFrameMain;
  /** The raw `IpcMainInvokeEvent`  */
  event: IpcMainInvokeEvent;
};
