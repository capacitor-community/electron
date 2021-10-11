---
sidebar_position: 4
---

# Config Options

You can use the options below in the `capacitor.config.ts` file under the `electron` prop. Please use `ElectronCapacitorConfig` exported from `@capacitor-community/electron` instead of `CapacitorConfig` from `@capacitor/cli`.\
All options are optional and can be omitted if you do not require them. The `backgroundColor` property will also be used to configure the Electron window color.\
Furthermore, you can edit and tinker with the `electron/src/index.ts` file as more is exposed to the developer as of V3.

```typescript
import { ElectronCapacitorConfig } from '@capacitor-community/electron';

const config: ElectronCapacitorConfig = {
  ...,
  electron: {
    // Custom scheme for your app to be served on in the electron window.
    customUrlScheme: 'capacitor-electron',
    // Switch on/off a tray icon and menu, which is customizable in the app.
    trayIconAndMenuEnabled: false,
    // Switch on/off whether or not a splashscreen will be used.
    splashScreenEnabled: false,
    // Custom image name in the electron/assets folder to use as splash image (.gif included)
    splashScreenImageName: 'splash.png',
    // Switch on/off if the main window should be hidden until brought to the front by the tray menu, etc.
    hideMainWindowOnLaunch: false,
    // Switch on/off whether or not to use deeplinking in your app.
    deepLinkingEnabled: false,
    // Custom protocol to be used with deeplinking for your app.
    deepLinkingCustomProtocol: 'mycapacitorapp',
  },
  ...
};

export default config;
```