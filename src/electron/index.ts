export * from "./definitions";
import { CapElectronEventEmitter, getCapacitorElectronConfig, setupCapacitorElectronPlugins } from "./util";
import { CapacitorSplashScreen } from "./ElectronSplashScreen";
import { setupElectronDeepLinking } from './ElectronDeepLinking'

export {
  CapacitorSplashScreen,
  CapElectronEventEmitter,
  getCapacitorElectronConfig,
  setupCapacitorElectronPlugins,
  setupElectronDeepLinking,
};
