import type {
  BatteryInfo,
  DeviceId,
  DeviceInfo,
  DevicePlugin,
  GetLanguageCodeResult
} from '../../src/definitions';

import { uuid4 } from './utils';

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
      uuid: uuid4(),
    };
  }

  async getBatteryInfo(): Promise<BatteryInfo> {
    return {
      batteryLevel: 0,
      isCharging: false,
    };
  }
}
