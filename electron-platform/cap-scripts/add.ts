import { existsSync, mkdirSync, renameSync } from "fs";
import { copySync } from "fs-extra";
import { join } from "path";
import { getCwd, runExec, readJSON } from "./common";

function checkRequirements() {
  const outPaths: {
    errorText: null | string;
    usersProjectCapConfigPath: null | string;
    srcTemplatePath: null | string;
    destTemplatePath: null | string;
    webAppPath: null | string;
  } = {
    errorText: null,
    usersProjectCapConfigPath: null,
    srcTemplatePath: null,
    destTemplatePath: null,
    webAppPath: null,
  };
  const usersProjectCapConfig = join(getCwd(), "capacitor.config.json");
  const srcDir = join(__dirname, "../", "template");
  const destDir = join(getCwd(), "electron");
  if (usersProjectCapConfig) {
    const capConfigJson = readJSON(usersProjectCapConfig);
    if (capConfigJson.webDir) {
      const webDirPath = join(getCwd(), capConfigJson.webDir);
      if (existsSync(webDirPath)) {
        if (!existsSync(destDir)) {
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

export async function doAdd() {
  const paths = checkRequirements();
  if (paths.errorText === null) {
    try {
      mkdirSync(paths.destTemplatePath!, { recursive: true });
      copySync(paths.srcTemplatePath!, paths.destTemplatePath!);
      renameSync(
        join(paths.destTemplatePath!, "gitignore"),
        join(paths.destTemplatePath!, ".gitignore")
      );
      copySync(
        paths.usersProjectCapConfigPath!,
        join(paths.destTemplatePath!, "capacitor.config.json")
      );
      copySync(paths.webAppPath!, join(paths.destTemplatePath!, "app"));
      await runExec(`cd ${paths.destTemplatePath} && npm i`);
    } catch (e) {
      throw e;
    }
  } else {
    throw new Error(paths.errorText);
  }
}
