"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCapacitorElectronDeepLinking = exports.createCapacitorElectronApp = void 0;
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./interfaces"), exports);
tslib_1.__exportStar(require("./CapacitorElectronApp"), exports);
const CapacitorElectronApp_1 = require("./CapacitorElectronApp");
function createCapacitorElectronApp(config) {
    if (config)
        return new CapacitorElectronApp_1.CapacitorElectronApp(config);
    return new CapacitorElectronApp_1.CapacitorElectronApp();
}
exports.createCapacitorElectronApp = createCapacitorElectronApp;
function createCapacitorElectronDeepLinking(capacitorElectronApp, config) {
    return new CapacitorElectronApp_1.ElectronCapacitorDeeplinking(capacitorElectronApp, config);
}
exports.createCapacitorElectronDeepLinking = createCapacitorElectronDeepLinking;
//# sourceMappingURL=index.js.map