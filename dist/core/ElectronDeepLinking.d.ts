import { ElectronCapacitorDeeplinkingConfig } from "./definitions";
export declare function setupElectronDeepLinking(capacitorElectronApp: any, config: ElectronCapacitorDeeplinkingConfig): ElectronCapacitorDeeplinking;
export declare class ElectronCapacitorDeeplinking {
    private customProtocol;
    private lastPassedUrl;
    private customHandler;
    private capacitorAppRef;
    constructor(capacitorApp: any, config: ElectronCapacitorDeeplinkingConfig);
    private internalHandler;
}
