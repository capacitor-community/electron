"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectronCapacitorDeeplinking = exports.setupElectronDeepLinking = void 0;
const electron_1 = require("electron");
const util_1 = require("./util");
function setupElectronDeepLinking(capacitorElectronApp, config) {
    return new ElectronCapacitorDeeplinking(capacitorElectronApp, config);
}
exports.setupElectronDeepLinking = setupElectronDeepLinking;
class ElectronCapacitorDeeplinking {
    constructor(capacitorApp, config) {
        this.customProtocol = "mycapacitorapp";
        this.lastPassedUrl = null;
        this.customHandler = null;
        this.capacitorAppRef = null;
        this.capacitorAppRef = capacitorApp;
        this.customProtocol = config.customProtocol;
        if (config.customHandler)
            this.customHandler = config.customHandler;
        util_1.CapElectronEventEmitter.on("CAPELECTRON_DeeplinkListenerInitialized", () => {
            if (this.capacitorAppRef !== null &&
                this.capacitorAppRef.getMainWindow() &&
                !this.capacitorAppRef.getMainWindow().isDestroyed() &&
                this.lastPassedUrl !== null &&
                this.lastPassedUrl.length > 0)
                this.capacitorAppRef
                    .getMainWindow()
                    .webContents.send("appUrlOpen", this.lastPassedUrl);
            this.lastPassedUrl = null;
        });
        const instanceLock = electron_1.app.requestSingleInstanceLock();
        if (instanceLock) {
            electron_1.app.on("second-instance", (_event, argv) => {
                if (process.platform === "win32") {
                    this.lastPassedUrl = argv.slice(1).toString();
                    this.internalHandler(this.lastPassedUrl);
                }
                if (!this.capacitorAppRef.getMainWindow().isDestroyed()) {
                    if (this.capacitorAppRef.getMainWindow().isMinimized())
                        this.capacitorAppRef.getMainWindow().restore();
                    this.capacitorAppRef.getMainWindow().focus();
                }
                else {
                    this.capacitorAppRef.init();
                }
            });
        }
        else {
            electron_1.app.quit();
        }
        if (!electron_1.app.isDefaultProtocolClient(this.customProtocol))
            electron_1.app.setAsDefaultProtocolClient(this.customProtocol);
        electron_1.app.on("open-url", (event, url) => {
            event.preventDefault();
            this.lastPassedUrl = url;
            this.internalHandler(url);
            if (this.capacitorAppRef &&
                this.capacitorAppRef.getMainWindow() &&
                this.capacitorAppRef.getMainWindow().isDestroyed())
                this.capacitorAppRef.init();
        });
        if (process.platform === "win32") {
            this.lastPassedUrl = process.argv.slice(1).toString();
            this.internalHandler(this.lastPassedUrl);
        }
    }
    internalHandler(urlLink) {
        if (urlLink !== null && urlLink.length > 0) {
            const paramsArr = urlLink.split(",");
            let url = "";
            for (let item of paramsArr) {
                if (item.indexOf(this.customProtocol) >= 0) {
                    url = item;
                    break;
                }
            }
            if (url.length > 0) {
                if (this.customHandler !== null && url !== null)
                    this.customHandler(url);
                if (this.capacitorAppRef !== null &&
                    this.capacitorAppRef.getMainWindow() &&
                    !this.capacitorAppRef.getMainWindow().isDestroyed())
                    this.capacitorAppRef
                        .getMainWindow()
                        .webContents.send("appUrlOpen", url);
            }
        }
    }
}
exports.ElectronCapacitorDeeplinking = ElectronCapacitorDeeplinking;
//# sourceMappingURL=ElectronDeepLinking.js.map