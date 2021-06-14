export * from "./definitions";
import { CapElectronEventEmitter, getCapacitorConfig, getWebAppLoader, setupCapacitorElectronPlugins } from "./utils";
import { CapacitorSplashScreen } from "./ElectronSplashScreen";
import { setupElectronDeepLinking } from './ElectronDeepLinking'

export {
  CapacitorSplashScreen,
  CapElectronEventEmitter,
  getCapacitorConfig,
  getWebAppLoader,
  setupCapacitorElectronPlugins,
  setupElectronDeepLinking,
};
