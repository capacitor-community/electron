import type {
  BatteryInfo,
  DeviceId,
  DeviceInfo,
  DevicePlugin,
  GetLanguageCodeResult
} from '../../src/definitions';

export class Device implements DevicePlugin {

  async getInfo(): Promise<DeviceInfo> {
    return {
      model: 'N/A',
      platform: <const>'electron',
      operatingSystem: 'unknown',
      osVersion: 'N/A',
      manufacturer: 'N/A',
      isVirtual: false,
      webViewVersion: 'N/A',
    };
  }

  async getLanguageCode(): Promise<GetLanguageCodeResult> {
    return {
      value: 'en',
    };
  }

  async getId(): Promise<DeviceId> {
    return {
      uuid: this.uuid4(),
    };
  }

  async getBatteryInfo(): Promise<BatteryInfo> {
    return {
      batteryLevel: 0,
      isCharging: false,
    };
  }
  
  uuid4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }
}
