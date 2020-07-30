export * from "./interfaces";
export * from "./CapacitorElectronApp";

import {
  CapacitorElectronConfig,
  ElectronCapacitorDeeplinkingConfig,
} from "./interfaces";
import {
  CapacitorElectronApp,
  ElectronCapacitorDeeplinking,
} from "./CapacitorElectronApp";

export function createCapacitorElectronApp(
  config?: CapacitorElectronConfig
): CapacitorElectronApp {
  if (config) return new CapacitorElectronApp(config);
  return new CapacitorElectronApp();
}

export function createCapacitorElectronDeepLinking(
  capacitorElectronApp: CapacitorElectronApp,
  config: ElectronCapacitorDeeplinkingConfig
): ElectronCapacitorDeeplinking {
  return new ElectronCapacitorDeeplinking(capacitorElectronApp, config);
}
