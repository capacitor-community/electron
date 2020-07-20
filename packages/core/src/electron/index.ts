export * from "./interfaces";
export * from "./CapacitorElectronApp";

import { CapacitorElectronConfig } from "./interfaces";
import { CapacitorElectronApp } from "./CapacitorElectronApp";

export function createCapacitorElectronApp(
  config?: CapacitorElectronConfig
): CapacitorElectronApp {
  if (config) return new CapacitorElectronApp(config);
  return new CapacitorElectronApp();
}
