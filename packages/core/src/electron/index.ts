export * from "./interfaces";
export * from "./CapacitorElectronApp";

import {
  CapacitorElectronConfig,
  ElectronDeeplinkingConfig,
} from "./interfaces";
import {
  CapacitorElectronApp,
  ElectronDeeplinking,
} from "./CapacitorElectronApp";

export function createCapacitorElectronApp(
  config?: CapacitorElectronConfig
): CapacitorElectronApp {
  if (config) return new CapacitorElectronApp(config);
  return new CapacitorElectronApp();
}

export function createCapacitorElectronDeepinking(
  capacitorElectronApp: CapacitorElectronApp,
  config: ElectronDeeplinkingConfig
): ElectronDeeplinking {
  return new ElectronDeeplinking(capacitorElectronApp, config);
}
