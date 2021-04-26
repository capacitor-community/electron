import { existsSync, mkdirSync, renameSync } from "fs";
import { copySync } from "fs-extra";
import { join } from "path";
import { getCwd, runExec, readJSON, writePrettyJSON, errorLog } from "./common";

function checkRequirements() {
  const cwd = getCwd();
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
  const usersProjectCapConfig = join(cwd, "capacitor.config.json");
  const srcDir = join(__dirname, "../", "template");
  const destDir = join(cwd, "electron");
  if (existsSync(usersProjectCapConfig)) {
    const capConfigJson = readJSON(usersProjectCapConfig);
    if (capConfigJson.webDir) {
      const webDirPath = join(cwd, capConfigJson.webDir);
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
      const electronConfig = readJSON(
        join(paths.destTemplatePath!, "capacitor.config.json")
      );
      const appName: string = electronConfig.appName!;
      const electronPackageJson = readJSON(
        join(paths.destTemplatePath!, "package.json")
      );
      electronPackageJson.name = appName;
      writePrettyJSON(
        join(paths.destTemplatePath!, "package.json"),
        electronPackageJson
      );
      copySync(paths.webAppPath!, join(paths.destTemplatePath!, "app"));
      await runExec(`cd ${paths.destTemplatePath!.replace(/ /g, '\\ ')} && npm i`);
    } catch (e) {
      errorLog(e.message);
      throw e;
    }
  } else {
    errorLog(paths.errorText);
    throw new Error(paths.errorText);
  }
}
