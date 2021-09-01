import type { CapacitorElectronExtendedConfig } from "./definitions";
import electronServe from "electron-serve";
declare const EventEmitter: any;
declare class CapElectronEmitter extends EventEmitter {
}
export declare const CapElectronEventEmitter: CapElectronEmitter;
export declare function getWebAppLoader(customUrlScheme: string): electronServe.loadURL;
export declare function deepMerge(target: any, _objects?: any[]): any;
export declare function pick<T>(object: Record<string, T>, keys: string[]): Record<string, T>;
export declare function setupCapacitorElectronPlugins(): void;
export declare function encodeFromFile(filePath: string): Promise<string>;
export declare function getCapacitorConfig(): CapacitorElectronExtendedConfig;
export {};
