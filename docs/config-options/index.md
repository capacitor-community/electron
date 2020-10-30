# **Config Options**

You can use the below options in the `index.ts` file of the electron platform in the line `const myCapacitorApp = createCapacitorElectronApp();`

<br />

`createCapacitorElectronApp([options])`

- `options` Object (optional)
  - `mainWindow` Object (optional) - Configuration for the main window object.
    - `windowOptions` [BrowserWindowConstructorOptions](https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions) (optional) - BrowserWindow options from electron, please refer to electron docs linked.
  - `trayMenu` Object (optional) - Options for configuring a tray icon / menu
    - `useTrayMenu` Boolean - Whether or not to enable a tray icon / menu
    - `trayIconPath` String (optional) - Path to your icon you want to use for the tray icon / menu
    - `trayContextMenu` [MenuItem[]](https://www.electronjs.org/docs/api/menu-item#new-menuitemoptions) (optional) - Electron MenuItem array, please refer to linked docs
  - `applicationMenuTemplate` NULL | {role: string} (optional) - Set as `NULL` to hide the menu bar all together, or use the [Roles](https://www.electronjs.org/docs/api/menu-item#new-menuitemoptions) as defined by electron as values for `role` in an object.
  - `splashScreen` Object (optional) - Custom Splash Screen options
    - `useSplashScreen` Boolean (optional) - Whether or not to show a splash screen on startup.
    - `splashOptions` Object (optional) - Options for the Splash Screen window.
      - `imageFilePath` String (optional) - Path to the Splash Screen image, (PNG, JPG, or GIF are preferable.)
      - `windowWidth` Number (optional) - Width in pixels of the Splash Screen window.
      - `windowHeight` Number (optional) - Height in pixels of the Splash Screen window.
