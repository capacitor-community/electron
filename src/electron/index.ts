export * from "./definitions";
import { CapElectronEventEmitter, getCapacitorConfig, setupCapacitorElectronPlugins } from "./util";
import { CapacitorSplashScreen } from "./ElectronSplashScreen";
import { setupElectronDeepLinking } from './ElectronDeepLinking'

export {
  CapacitorSplashScreen,
  CapElectronEventEmitter,
  getCapacitorConfig,
  setupCapacitorElectronPlugins,
  setupElectronDeepLinking,
};
