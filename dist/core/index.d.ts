export * from "./interfaces";
export * from "./CapacitorElectronApp";
import { CapacitorElectronConfig, ElectronCapacitorDeeplinkingConfig } from "./interfaces";
import { CapacitorElectronApp, ElectronCapacitorDeeplinking } from "./CapacitorElectronApp";
export declare function createCapacitorElectronApp(config?: CapacitorElectronConfig): CapacitorElectronApp;
export declare function createCapacitorElectronDeepLinking(capacitorElectronApp: CapacitorElectronApp, config: ElectronCapacitorDeeplinkingConfig): ElectronCapacitorDeeplinking;
