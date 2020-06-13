const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");

async function doCapCopy() {
  const capConfigJson = JSON.parse(
    fs.readFileSync(usersProjectCapConfig, "utf-8")
  );
  if (capConfigJson.webDir) {
    const webDirPath = path.join(process.env.INIT_CWD, capConfigJson.webDir);
    const destPath = path.join(process.env.INIT_CWD, "electron");
    if (fs.existsSync(webDirPath)) {
      if (fs.existsSync(destPath)) {
        fse.copySync(webDirPath, path.join(destPath, "app"));
        console.log("Webapp copied to Electron Platform!");
      } else {
        throw new Error(
          "Electron platform not found in project. Add with: npm i @capacitor-community/electron-platform"
        );
      }
    } else {
      throw new Error(
        "The webDir referenced in capcacitor.config.json does not exist."
      );
    }
  } else {
    throw new Error("webDir is not defined in capacitor.config.json");
  }
}

(() => {
  doCapCopy();
})();
