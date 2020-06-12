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
  const usersProjectCapConfig = path.join(
    process.env.INIT_CWD,
    "capacitor.config.json"
  );
  const srcDir = path.join(__dirname, "../", "electron_template");
  const destDir = path.join(process.env.INIT_CWD, "electron");
  if (fs.existsSync(usersProjectCapConfig)) {
    const capConfigJson = JSON.parse(
      fs.readFileSync(usersProjectCapConfig, "utf-8")
    );
    if (capConfigJson.webDir) {
      const webDirPath = path.join(process.env.INIT_CWD, capConfigJson.webDir);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
        fse.copySync(srcDir, destDir);
        console.log(await runExec(`cd ${destDir} && npm i`));
        console.log("Electron platform added!");
      } else {
        console.warn(`${destDir} already exists.`);
      }
      if (fs.existsSync(webDirPath)) {
        fse.copySync(webDirPath, path.join(destDir, "app"));
        console.log("Webapp copied to Electron Platform!");
      } else {
        throw new Error(
          "The webDir referenced in capcacitor.config.json does not exsist."
        );
      }
    } else {
      throw new Error("webDir is not defined in capacitor.config.json");
    }
  } else {
    throw new Error(
      "No capacitor.config.json file found. Did you initiate capcacitor for this project?"
    );
  }
}

(() => {
  doPostInstall();
})();
