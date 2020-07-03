import {
  WebPlugin,
  AppPlugin,
  AppPluginWeb,
  AppLaunchUrl,
  AppState,
} from "@capacitor/core";

const { remote, shell, ipcRenderer } = require("electron");
const webApp = new AppPluginWeb();

interface WindowListenerHandle {
  registered: boolean;
  windowEventName: string;
  pluginEventName: string;
  handler: (event: any) => void;
}

type ListenerCallback = (err: any, ...args: any[]) => void;

export class AppPluginElectron extends WebPlugin implements AppPlugin {
  launchUrl: { url: string } = { url: "" };
  listeners: { [eventName: string]: ListenerCallback[] } = {};
  windowListeners: { [eventName: string]: WindowListenerHandle } = {};

  constructor() {
    super({
      name: "App",
      platforms: ["electron"],
    });

    // @ts-ignore
    ipcRenderer.on("appUrlOpen", (event: any, url: string) => {
      this.launchUrl = { url };
      this.notifyListeners("appUrlOpen", { url });
    });
  }

  getAppPath(): string {
    return remote.app.getAppPath();
  }
  exitApp(): never {
    let w = remote.getCurrentWindow();
    w && w.close();
    throw new Error("App quit");
  }
  canOpenUrl(_options: { url: string }): Promise<{ value: boolean }> {
    return Promise.resolve({ value: true });
  }
  openUrl(options: { url: string }): Promise<{ completed: boolean }> {
    shell.openExternal(options.url);
    return Promise.resolve({ completed: true });
  }
  getLaunchUrl(): Promise<AppLaunchUrl> {
    return Promise.resolve(this.launchUrl);
  }
  getState(): Promise<AppState> {
    return webApp.getState();
  }
}

const App = new AppPluginElectron();

export { App };
