import { app } from "electron";
import unhandled from "electron-unhandled";
import { autoUpdater } from "electron-updater";
import { electronCapacitorApp, setupContentSecurityPolicy } from "./setup";
// import logger from 'electron-log';

// Graceful handling of unhandled errors.
unhandled();

// Run Application
(async () => {
  // Wait for electron app to be ready.
  await app.whenReady();
  // Security - Set Content-Security-Policy based on whether or not we are in dev mode.
  setupContentSecurityPolicy();
  // Initialize our app, build windows, and load content.
  await electronCapacitorApp.init();
  // Check for updates if we are in a packaged app.
  autoUpdater.checkForUpdatesAndNotify();
})();

// Handle when all of our windows are close (platforms have their own expectations).
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// When the dock icon is clicked.
app.on("activate", async function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (electronCapacitorApp.getMainWindow().isDestroyed()) {
    await electronCapacitorApp.init();
  }
});

// Place all ipc or other electron api calls and custom functionality under this line
