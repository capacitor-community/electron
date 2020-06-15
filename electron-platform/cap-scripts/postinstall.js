const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");
const { exec } = require("child_process");
const ora = require("ora");

function runExec(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stdout + stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

function checkRequirements() {
  const outPaths = {
    errorText: null,
    usersProjectCapConfigPath: null,
    srcTemplatePath: null,
    destTemplatePath: null,
    webAppPath: null,
  };
  const usersProjectCapConfig = path.join(
    process.env.INIT_CWD,
    "capacitor.config.json"
  );
  const srcDir = path.join(__dirname, "../", "electron_template");
  const destDir = path.join(process.env.INIT_CWD, "electron");
  if (usersProjectCapConfig) {
    const capConfigJson = JSON.parse(
      fs.readFileSync(usersProjectCapConfig, "utf-8")
    );
    if (capConfigJson.webDir) {
      const webDirPath = path.join(process.env.INIT_CWD, capConfigJson.webDir);
      if (fs.existsSync(webDirPath)) {
        if (!fs.existsSync(destDir)) {
          outPaths.destTemplatePath = destDir;
          outPaths.srcTemplatePath = srcDir;
          outPaths.usersProjectCapConfigPath = usersProjectCapConfig;
          outPaths.webAppPath = webDirPath;
        } else {
          outPaths.errorText = "Electron platform already exists.";
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

function createElectronFolder(srcDir, destDir) {
  const createElectronFolderStepSpinner = ora({
    text: "[Electron Platform] Creating electron platform folder...",
  });
  createElectronFolderStepSpinner.start();
  try {
    fs.mkdirSync(destDir, { recursive: true });
    fse.copySync(srcDir, destDir);
    fs.renameSync(path.join(destDir, 'gitignore'), path.join(destDir, '.gitignore'));
    createElectronFolderStepSpinner.succeed();
  } catch (e) {
    createElectronFolderStepSpinner.fail();
    throw e;
  }
}

function copyRootCapConfig(usersProjectCapConfig, destDir) {
  const copyCapacitorConfigStepSpinner = ora({
    text: "[Electron Platform] Copying capacitor.config.json to platform...",
  });
  copyCapacitorConfigStepSpinner.start();
  try {
    fse.copySync(
      usersProjectCapConfig,
      path.join(destDir, "capacitor.config.json")
    );
    copyCapacitorConfigStepSpinner.succeed();
  } catch (e) {
    copyCapacitorConfigStepSpinner.fail();
    throw e;
  }
}

function copyBuiltWebApp(webDirPath, destDir) {
  const copyWebDirStepSpinner = ora({
    text: "[Electron Platform] Copying webDir to platform...",
  });
  copyWebDirStepSpinner.start();
  try {
    fse.copySync(webDirPath, path.join(destDir, "app"));
    copyWebDirStepSpinner.succeed();
  } catch (e) {
    copyWebDirStepSpinner.fail();
    throw e;
  }
}

async function runNpmInstallOnPlatform(destDir) {
  const npmInstallForPlatformStepSpinner = ora({
    text: "[Electron Platform] Running npm install on platform...",
  });
  npmInstallForPlatformStepSpinner.start();
  try {
    await runExec(`cd ${destDir} && npm i`);
    npmInstallForPlatformStepSpinner.succeed();
  } catch (e) {
    npmInstallForPlatformStepSpinner.fail();
    throw e;
  }
}

async function doPostInstall() {
  if (!fs.existsSync(path.join(__dirname, "../", ".no-postinstall-script"))) {
    const requirementsStepSpinner = ora({
      text: "[Electron Platform] Checking requirements...",
    });
    requirementsStepSpinner.start();
    const paths = checkRequirements();
    if (paths.errorText === null) {
      requirementsStepSpinner.succeed();
      createElectronFolder(paths.srcTemplatePath, paths.destTemplatePath);
      copyRootCapConfig(
        paths.usersProjectCapConfigPath,
        paths.destTemplatePath
      );
      copyBuiltWebApp(paths.webAppPath, paths.destTemplatePath);
      await runNpmInstallOnPlatform(paths.destTemplatePath);
      console.log("[Electron Platform] Electron platform added!");
    } else {
      requirementsStepSpinner.fail();
      throw new Error(errorText);
    }
  } else {
    console.log(
      "[Electron Platform] Dev enviroment found, skipping postinstall script."
    );
  }
}

(() => {
  doPostInstall();
})();
