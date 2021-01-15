import { existsSync, renameSync } from "fs";
import { copySync } from "fs-extra";
import { join } from "path";
import {
  getCapacitorElectronNodeModuleDir,
  getUsersProjectDir,
  readJSON,
  runExec,
  writePrettyJSON,
} from "./common";
import { customLoadConfig } from "./config";

export async function doAdd() {
  try {
    const usersProjectDir = getUsersProjectDir();
    const capacitorElectronNodeModuleTemplateDir = join(
      getCapacitorElectronNodeModuleDir(),
      "template"
    );
    const destDir = join(usersProjectDir, "electron");
    const usersProjectCapConfigFile = join(
      usersProjectDir,
      "capacitor.config.ts"
    );

    const configData = await customLoadConfig(usersProjectDir);
    //console.log(configData);

    const builtWebAppDir = configData.app.webDirAbs;

    if (!existsSync(destDir)) {
      copySync(capacitorElectronNodeModuleTemplateDir, destDir);
      copySync(usersProjectCapConfigFile, join(destDir, "capacitor.config.ts"));
      renameSync(join(destDir, "gitignore"), join(destDir, ".gitignore"));
      copySync(builtWebAppDir, join(destDir, "app"));

      const appName: string = configData.app.appName!;
      const electronPackageJson = readJSON(join(destDir, "package.json"));
      electronPackageJson.name = appName;
      writePrettyJSON(join(destDir, "package.json"), electronPackageJson);

      await runExec(`cd ${destDir} && npm i`);
    } else {
      throw new Error("Electron platform already exists.");
    }
  } catch (e) {
    throw e;
  }
}
