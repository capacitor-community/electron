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
    indent: 4,
  });
  const createElectronFolderStepSpinner = ora({
    text: "Checking requirements...",
    indent: 4,
  });
  const copyCapacitorConfigStepSpinner = ora({
    text: "Checking requirements...",
    indent: 4,
  });
  const copyWebDirStepSpinner = ora({
    text: "Checking requirements...",
    indent: 4,
  });
  const npmInstallForPlatformStepSpinner = ora({
    text: "Checking requirements...",
    indent: 4,
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
          if (fs.exists(webDirPath)) {
            if (!fs.exists(destDir)) {
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
    }
  } catch (e) {
    requirementsStepSpinner.fail(`${e.message}`);
    throw e;
  }
}

(() => {
  doPostInstall();
})();
