"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupElectronDeepLinking = exports.setupCapacitorElectronPlugins = exports.getWebAppLoader = exports.getCapacitorConfig = exports.CapElectronEventEmitter = exports.CapacitorSplashScreen = void 0;
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./definitions"), exports);
const util_1 = require("./util");
Object.defineProperty(exports, "CapElectronEventEmitter", { enumerable: true, get: function () { return util_1.CapElectronEventEmitter; } });
Object.defineProperty(exports, "getCapacitorConfig", { enumerable: true, get: function () { return util_1.getCapacitorConfig; } });
Object.defineProperty(exports, "getWebAppLoader", { enumerable: true, get: function () { return util_1.getWebAppLoader; } });
Object.defineProperty(exports, "setupCapacitorElectronPlugins", { enumerable: true, get: function () { return util_1.setupCapacitorElectronPlugins; } });
const ElectronSplashScreen_1 = require("./ElectronSplashScreen");
Object.defineProperty(exports, "CapacitorSplashScreen", { enumerable: true, get: function () { return ElectronSplashScreen_1.CapacitorSplashScreen; } });
const ElectronDeepLinking_1 = require("./ElectronDeepLinking");
Object.defineProperty(exports, "setupElectronDeepLinking", { enumerable: true, get: function () { return ElectronDeepLinking_1.setupElectronDeepLinking; } });
//# sourceMappingURL=index.js.map