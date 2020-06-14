const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");
const { exec } = require("child_process");

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

async function doPostInstall() {
  const ora = require("ora");
  const platformSpinner = ora("Installing Electron Platform...").start();
  const requirementsStepSpinner = ora({
    text: "Checking requirements...",
  });
  const createElectronFolderStepSpinner = ora({
    text: "Creating electron platform folder...",
  });
  const copyCapacitorConfigStepSpinner = ora({
    text: "Copying capacitor.config.json to platform...",
  });
  const copyWebDirStepSpinner = ora({
    text: "Copying webDir to platform...",
  });
  const npmInstallForPlatformStepSpinner = ora({
    text: "Running npm install on platform...",
  });
  try {
    requirementsStepSpinner.start();
    if (!fs.existsSync(path.join(__dirname, "../", ".no-postinstall-script"))) {
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
          const webDirPath = path.join(
            process.env.INIT_CWD,
            capConfigJson.webDir
          );
          if (fs.existsSync(webDirPath)) {
            if (!fs.existsSync(destDir)) {
              requirementsStepSpinner.succeed();
              createElectronFolderStepSpinner.start();
              fs.mkdirSync(destDir, { recursive: true });
              fse.copySync(srcDir, destDir);
              createElectronFolderStepSpinner.succeed();
              copyCapacitorConfigStepSpinner.start();
              fse.copySync(
                usersProjectCapConfig,
                path.join(destDir, "capacitor.config.json")
              );
              copyCapacitorConfigStepSpinner.succeed();
              copyWebDirStepSpinner.start();
              fse.copySync(webDirPath, path.join(destDir, "app"));
              copyWebDirStepSpinner.succeed();
              npmInstallForPlatformStepSpinner.start();
              console.log(await runExec(`cd ${destDir} && npm i`));
              npmInstallForPlatformStepSpinner.succeed();
              platformSpinner.succeed("Electron platform added!");
            } else {
              throw new Error("Electron platform folder already exists.");
            }
          } else {
            throw new Error(
              "The webDir referenced in capcacitor.config.json does not exsist."
            );
          }
        } else {
          throw new Error(
            "Property webDir is not defined in capacitor.config.json."
          );
        }
      } else {
        throw new Error(
          "No capacitor.config.json file found. Did you initiate capcacitor for this project?"
        );
      }
    } else {
      requirementsStepSpinner.info("Dev enviroment, skipping...");
      platformSpinner.info("Skipped.");
    }
  } catch (e) {
    requirementsStepSpinner.fail(`${e.message}`);
    throw e;
  }
}

(() => {
  doPostInstall();
})();
