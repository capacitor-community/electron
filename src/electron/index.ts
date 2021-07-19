import { setupElectronDeepLinking } from './ElectronDeepLinking';
import { CapacitorSplashScreen } from './ElectronSplashScreen';
import {
  CapElectronEventEmitter,
  getCapacitorElectronConfig,
  setupCapacitorElectronPlugins,
} from './util';

export * from './definitions';

export {
  CapacitorSplashScreen,
  CapElectronEventEmitter,
  getCapacitorElectronConfig,
  setupCapacitorElectronPlugins,
  setupElectronDeepLinking,
};
