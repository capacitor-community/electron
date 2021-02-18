import { existsSync } from "fs";
import { copySync, removeSync } from "fs-extra";
import { errorLog } from "./common";
import { join } from "path";

/*
function checkRequirements() {
  const outPaths: {
    errorText: null | string;
    usersProjectCapConfigPath: null | string;
    destTemplatePath: null | string;
    webAppPath: null | string;
  } = {
    errorText: null,
    usersProjectCapConfigPath: null,
    destTemplatePath: null,
    webAppPath: null,
  };
  const usersProjectCapConfig = join(getCwd(), "capacitor.config.json");
  const destDir = join(getCwd(), "electron");
  if (usersProjectCapConfig) {
    const capConfigJson = readJSON(usersProjectCapConfig);
    if (capConfigJson.webDir) {
      const webDirPath = join(getCwd(), capConfigJson.webDir);
      if (existsSync(webDirPath)) {
        if (existsSync(destDir)) {
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
*/

export async function doCopy() {
  const usersProjectDir = process.env.CAPACITOR_ROOT_DIR!;
  // const configData = JSON.parse(process.env.CAPACITOR_CONFIG!);
  const builtWebAppDir = process.env.CAPACITOR_WEB_DIR!;
  const destDir = join(usersProjectDir, "electron", "app");

  try {
    if (existsSync(destDir)) removeSync(destDir);
    copySync(builtWebAppDir, destDir);
  } catch (e) {
    errorLog(e.message);
    throw e;
  }
}
