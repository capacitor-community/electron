# Documentation

---

## Functions

- **createCapacitorElectronApp**(**`config?`**: _`CapacitorElectronConfig`_)
  - **Returns** : _CapacitorElectronApp_

---

## Classes

- **CapacitorElectronApp**
  - **Constructor**
    - **new CapacitorElectronApp**(**`config?`**: _`CapacitorElectronConfig`_)
  - **Instance Methods**
    - **getMainWindow()** : _Electron.BrowserWindow_
      - Gets the mainWindow instance for your app.
    - **init()** : _void_
      - Creates mainwindow and does all setup. _Call after app.on('ready') event fired._
    - **getTrayIcon()** : _Electron.Tray_
      - Gets the Tray (icon/menu) instance for your app.

---

## Interfaces

- CapacitorElectronConfig :
  ```typescript
  {
      applicationMenuTemplate?,
      deepLinking?,
      mainWindow?,
      splashScreen?,
  }
  ```
  - **applicationMenuTemplate**? : _object[] | null_
    - **_Description:_** Define your applications native menu bar. Set to _null_ if you want to hide the bar.
    - **_Default:_**
      ```typescript
      [
        { role: process.platform === "darwin" ? "appMenu" : "fileMenu" },
        { role: "viewMenu" },
      ];
      ```
  - **deepLinking**? : _object_
    - **deeplinkingHandlerFunction**? : (`deeplinkingUrl`: string): _void_ | _null_
      - **_Description:_** Optional handler to deal with deeplink urls in the main process of electron.
      - **_Default:_** _null_
    - **customProtocol**? : _null_ | _string_
      - **_Description:_** When set to a string value this will enable deeplinking with the custom protocol passed.
      - **_Default:_** _null_
  - **mainWindow**? : _object_
    - **windowOptions**? : _object_ **_(All Electron.BrowserWindowConstructorOptions props exposed, these are just defaults)_**
      - **height**? : _number_
        - **_Description:_** Start height of the main application window in px.
        - **_Default:_** _920_
      - **width**? : _number_
        - **_Description:_** Start width of the main application window in px.
        - **_Default:_** _1600_
      - **icon**? : _string_
        - **_Description:_** Path of the icon file for the main window.
        - **_Default:_** `path.join(app.getAppPath(), "assets", process.platform === "win32" ? "appIcon.ico" : "appIcon.png")`
  - **splashScreen**? : _object_
    - **useSplashScreen**? : _boolean_
      - **_Description:_** Whether or not to show a splash screen on startup.
      - **_Default:_** _true_
    - **splashOptions**? : _object_
      - **imageFilePath**? : _string_
        - **_Description:_** Where the splash screen image is located.
        - **_Default:_** `path.join(app.getAppPath(), "assets", "splash.png")`
      - **windowWidth**? : _number_
        - **_Description:_** Window width in px.
        - **_Default:_** _400_
      - **windowHeight**? : _number_
        - **_Description:_** Window height in px.
        - **_Default:_** _400_
      - **textColor**? : _string_
        - **_Description:_**
        - **_Default:_**
      - **loadingText**? : _string_
        - **_Description:_**
        - **_Default:_**
      - **textPercentageFromTop**? : _number_
        - **_Description:_**
        - **_Default:_**
      - **transparentWindow**? : _boolean_
        - **_Description:_**
        - **_Default:_**
      - **autoHideLaunchSplash**? : _boolean_
        - **_Description:_** Whether or not to auto hide a splash screen or if the app will hide it.
        - **_Default:_** _true_
      - **customHtml**? : _string_ | _null_
        - **_Description:_**
        - **_Default:_**
