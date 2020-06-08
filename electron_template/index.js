const { app, dialog } = require("electron");
const path = require("path");
const { CapacitorElectronApp } = require("@capacitor-community/electron");

// mainWidow prop is exposed on CapacitorElectronApp to allow for usage outside of Capacitors Configuration.
const myCapacitorApp = new CapacitorElectronApp({
  deepLinking: {
    useDeeplinking: true,
    deeplinkingCustomProtocol: "mycapacitorapp",
    deeplinkingHandlerFunction: (deeplinkingUrl) => {
      //Do something with passed deeplinking url (ex: mycapacitorapp://testing)
      console.log(deeplinkingUrl);
      dialog.showMessageBox(myCapacitorApp.mainWindow, {
        message: deeplinkingUrl,
        title: "Log",
        buttons: ["Okay"],
      });
    },
  },
  splashScreen: {
    useSplashScreen: true,
    splashOptions: {
      imageFilePath: path.join(app.getAppPath(), "assets", "splash.png"),
      windowWidth: 400,
      windowHeight: 400,
      autoHideLaunchSplash: true,
    },
  },
  mainWindow: {
    menuTemplateDev: null,
    devServer: {
      useDevServer: false,
      devServerURL: "http://localhost:3000",
    },
    windowOptions: {
      height: 920,
      width: 1600,
      icon: path.join(app.getAppPath(), "assets", "appIcon.png"),
      title: "Capacitor App",
    },
  },
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some Electron APIs can only be used after this event occurs.
app.on("ready", () => {
  myCapacitorApp.init();
});

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    myCapacitorApp.init();
  }
});

// Define any IPC or other custom functionality below here
