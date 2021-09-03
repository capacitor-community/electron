import { app } from 'electron';

import type { ElectronCapacitorDeeplinkingConfig } from './definitions';
import { CapElectronEventEmitter } from './util';

export function setupElectronDeepLinking(
  capacitorElectronApp: any,
  config: ElectronCapacitorDeeplinkingConfig
): ElectronCapacitorDeeplinking {
  return new ElectronCapacitorDeeplinking(capacitorElectronApp, config);
}

export class ElectronCapacitorDeeplinking {
  private customProtocol = 'mycapacitorapp';
  private lastPassedUrl: null | string = null;
  private customHandler: (url: string) => void | null = null;
  private capacitorAppRef: any = null;

  constructor(capacitorApp: any, config: ElectronCapacitorDeeplinkingConfig) {
    this.capacitorAppRef = capacitorApp;
    this.customProtocol = config.customProtocol;
    if (config.customHandler) this.customHandler = config.customHandler;

    CapElectronEventEmitter.on('CAPELECTRON_DeeplinkListenerInitialized', () => {
      if (
        this.capacitorAppRef?.getMainWindow() &&
        !this.capacitorAppRef.getMainWindow().isDestroyed() &&
        this.lastPassedUrl !== null &&
        this.lastPassedUrl.length > 0
      )
        this.capacitorAppRef.getMainWindow().webContents.send('appUrlOpen', this.lastPassedUrl);
      this.lastPassedUrl = null;
    });

    const instanceLock = app.requestSingleInstanceLock();
    if (instanceLock) {
      app.on('second-instance', (_event, argv) => {
        if (process.platform === 'win32') {
          this.lastPassedUrl = argv.slice(1).toString();
          this.internalHandler(this.lastPassedUrl);
        }
        if (!this.capacitorAppRef.getMainWindow().isDestroyed()) {
          if (this.capacitorAppRef.getMainWindow().isMinimized()) this.capacitorAppRef.getMainWindow().restore();
          this.capacitorAppRef.getMainWindow().focus();
        } else {
          this.capacitorAppRef.init();
        }
      });
    } else {
      app.quit();
    }

    if (!app.isDefaultProtocolClient(this.customProtocol)) app.setAsDefaultProtocolClient(this.customProtocol);
    app.on('open-url', (event, url) => {
      event.preventDefault();
      this.lastPassedUrl = url;
      this.internalHandler(url);
      if (this.capacitorAppRef?.getMainWindow()?.isDestroyed()) this.capacitorAppRef.init();
    });

    if (process.platform === 'win32') {
      this.lastPassedUrl = process.argv.slice(1).toString();
      this.internalHandler(this.lastPassedUrl);
    }
  }

  private internalHandler(urlLink: string | null) {
    if (urlLink !== null && urlLink.length > 0) {
      const paramsArr = urlLink.split(',');
      let url = '';
      for (const item of paramsArr) {
        if (item.indexOf(this.customProtocol) >= 0) {
          url = item;
          break;
        }
      }
      if (url.length > 0) {
        if (this.customHandler !== null && url !== null) this.customHandler(url);
        if (this.capacitorAppRef?.getMainWindow() && !this.capacitorAppRef.getMainWindow().isDestroyed())
          this.capacitorAppRef.getMainWindow().webContents.send('appUrlOpen', url);
      }
    }
  }
}
