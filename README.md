# Capacitor Electron

Capacitor community support for the Electron platform.

<!-- Badges -->
<a href="https://npmjs.com/package/@capacitor-community/electron-core">
  <img src="https://img.shields.io/npm/v/@capacitor-community/electron-core.svg">
</a>
<a href="https://npmjs.com/package/@capacitor-community/electron">
  <img src="https://img.shields.io/npm/l/@capacitor-community/electron.svg">
</a>
<a href="https://www.electronjs.org/releases/stable?version=9">
  <img src="https://img.shields.io/badge/supported%20electron%20version-~9.0.0-blue">
</a>
<a href="https://lerna.js.org/">
  <img src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg">
</a>

## Maintainers

| Maintainer | GitHub                                  | Social                                    | Sponsoring Company | Primary |
| ---------- | --------------------------------------- | ----------------------------------------- | ------------------ | ------- |
| Mike S.    | [IT-MikeS](https://github.com/IT-MikeS) | [@IT_MikeS](https://twitter.com/IT_MikeS) | Volunteer          | Yes     |
| Max Lynch  | [mlynch](https://github.com/mlynch)     | [@maxlynch](https://twitter.com/maxlynch) | Ionic              | _No_    |

Maintenance Status: Actively Maintained

## Docs:

- [Typedoc Docs](https://capacitor-community.github.io/electron/) about config and usage options.

## Basic Usage Steps:

1. Run `npx cap add electron` in your project directory.
2. Open a terminal in the `electron` folder that was created in your project directory and run `npm run electron:start` to start your app with the default config.

## Using your own image for the Splash Screen

`@capacitor-community/electron` looks in the `YOUR_APP_ROOT/electron/assets` folder for a `splash.png` file by default, but you can use your own image by using one of the following methods:

1. Editing the `splash.png` file directly.
2. Place your own image file into the `assets` folder and pass the `imageFilePath` property as part of `splashScreen -> splashOptions` into `CapacitorElectronApp()`. For example if your image was named `myImage.gif` (yes animated GIF's are valid) you would pass it like this:

```typescript
  const {app, ......} = require('electron');
  const path = require('path');

  .....

  const myCapacitorApp = new CapacitorElectronApp({
    splashScreen: {
      splashOptions: {
        imageFilePath: path.join(app.getAppPath(), "assets", "myImage.gif")
      }
    }
  });
```

## Great electron packages to consider for your project.

- [Electron-Unhandled](https://github.com/sindresorhus/electron-unhandled): Catch unhandled errors and promise rejections in your Electron app.
- [Electron-Timber](https://github.com/sindresorhus/electron-timber): Pretty console logger for Electron apps.
- [Electron-Util](https://github.com/sindresorhus/electron-util): Useful utilities for Electron apps and modules.
- [Electron-Debug](https://github.com/sindresorhus/electron-debug): Adds useful debug features to your Electron app.
- [Devtron](https://www.electronjs.org/devtron): An open source tool to help you inspect, monitor, and debug your Electron app.
- [Electron-Better-IPC](https://github.com/sindresorhus/electron-better-ipc): Simplified IPC communication for Electron apps.
- [Electron-Store](https://github.com/sindresorhus/electron-store): Simple data persistence for your Electron app - Save and load user preferences, app state, cache, etc

And more can be found on the [Awesome Electron List](https://github.com/sindresorhus/awesome-electron).
