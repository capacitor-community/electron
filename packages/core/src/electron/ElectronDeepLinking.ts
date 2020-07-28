import Electron from "electron";
import { DeeplinkingOptions } from "./interfaces";

const electron = require("electron");
const app = electron.app;

export class CapacitorDeeplinking {
  private mainWindowReference: Electron.BrowserWindow = null;

  private passedDeeplinkingUrl = "";
  private internalDeeplinkHandler: (deeplinkUrl: string) => void = (
    deeplinkUrl: string
  ) => {
    const paramsArr = deeplinkUrl.split(",");
    let url = "";
    for (let item of paramsArr) {
      if (item.indexOf(this.deeplinkingOptions.customProtocol) >= 0) {
        url = item;
        break;
      }
    }
    this.passedDeeplinkingUrl = url;

    if (this.passedDeeplinkingUrl.length > 0) {
      this.mainWindowReference.webContents.send("appUrlOpen", url);
      if (this.userDeeplinkHandler !== null) this.userDeeplinkHandler(url);
    }
  };
  deeplinkingOptions: DeeplinkingOptions = {
    customProtocol: "app",
  };
  userDeeplinkHandler: (deeplinkUrl: string) => void | null = null;

  constructor(
    mainWindowRef: Electron.BrowserWindow,
    options?: DeeplinkingOptions
  ) {
    this.mainWindowReference = mainWindowRef;
    if (options) {
      this.deeplinkingOptions = Object.assign(this.deeplinkingOptions, options);
    }
  }

  init(deepLinkHandler?: (deeplinkUrl: string) => void) {
    if (deepLinkHandler) this.userDeeplinkHandler = deepLinkHandler;

    const instanceLock = app.requestSingleInstanceLock();
    if (instanceLock) {
      //@ts-ignore
      app.on("second-instance", (event, argv) => {
        console.log("second inst");
        if (process.platform == "win32") {
          this.passedDeeplinkingUrl = argv.slice(1).toString();
        }
        this.internalDeeplinkHandler(this.passedDeeplinkingUrl);

        if (this.mainWindowReference) {
          if (this.mainWindowReference.isMinimized())
            this.mainWindowReference.restore();
          this.mainWindowReference.focus();
        }
      });
    } else {
      app.quit();
      return;
    }

    if (!app.isDefaultProtocolClient(this.deeplinkingOptions.customProtocol)) {
      // Deep linking only works on packaged versions of the app!
      app.setAsDefaultProtocolClient(this.deeplinkingOptions.customProtocol);
    }

    //app.on("will-finish-launching", () => {
    app.on("open-url", (event, url) => {
      event.preventDefault();
      this.passedDeeplinkingUrl = url;
      this.internalDeeplinkHandler(url);
    });
    //});

    if (process.platform == "win32") {
      this.passedDeeplinkingUrl = process.argv.slice(1).toString();
      this.internalDeeplinkHandler(this.passedDeeplinkingUrl);
    }
  }

  getPassedDeeplinkUrl(): string {
    return this.passedDeeplinkingUrl;
  }
}
