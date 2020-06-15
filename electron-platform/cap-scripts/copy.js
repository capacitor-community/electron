const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");
const ora = require("ora");

function checkRequirements() {
  const outPaths = {
    errorText: null,
    usersProjectCapConfigPath: null,
    destTemplatePath: null,
    webAppPath: null,
  };
  const usersProjectCapConfig = path.join(
    process.env.INIT_CWD,
    "capacitor.config.json"
  );
  const destDir = path.join(process.env.INIT_CWD, "electron");
  if (usersProjectCapConfig) {
    const capConfigJson = JSON.parse(
      fs.readFileSync(usersProjectCapConfig, "utf-8")
    );
    if (capConfigJson.webDir) {
      const webDirPath = path.join(process.env.INIT_CWD, capConfigJson.webDir);
      if (fs.existsSync(webDirPath)) {
        if (fs.existsSync(destDir)) {
          outPaths.destTemplatePath = destDir;
          outPaths.usersProjectCapConfigPath = usersProjectCapConfig;
          outPaths.webAppPath = webDirPath;
        } else {
          outPaths.errorText = "Electron platform not installed.";
        }
      } else {
        outPaths.errorText =
          "WebDir defined in capacitor.config.json does not exist, did you build your webapp?";
      }
    } else {
      outPaths.errorText = "No webDir defined in capacitor.config.json.";
    }
  } else {
    outPaths.errorText =
      "capacitor.config.json does not exist, did you setup capacitor in your project root?";
  }
  return outPaths;
}

function copyBuiltWebApp(webDirPath, destDir) {
  const copyWebDirStepSpinner = ora({
    text: "[Electron Platform - Copy] Copying webDir to platform...",
  });
  copyWebDirStepSpinner.start();
  try {
    const platformAppFolder = path.join(destDir, "app");
    if (fs.existsSync(platformAppFolder)) fse.removeSync(platformAppFolder);
    fse.copySync(webDirPath, platformAppFolder);
    copyWebDirStepSpinner.succeed();
  } catch (e) {
    copyWebDirStepSpinner.fail();
    throw e;
  }
}

async function doCapCopy() {
  const requirementsStepSpinner = ora({
    text: "[Electron Platform - Copy] Checking requirements...",
  });
  requirementsStepSpinner.start();
  const paths = checkRequirements();
  if (paths.errorText === null) {
    copyBuiltWebApp(paths.webAppPath, paths.destTemplatePath);
    console.log(
      "[Electron Platform - Copy] WebApp copied to electron platform!"
    );
  } else {
    requirementsStepSpinner.fail();
    throw new Error(errorText);
  }
}

(() => {
  doCapCopy();
})();
