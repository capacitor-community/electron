import { existsSync, renameSync } from "fs";
import { copySync } from "fs-extra";
import { join } from "path";
import { readJSON, runExec, writePrettyJSON } from "./common";

export async function doAdd() {
  try {
    const usersProjectDir = process.env.CAPACITOR_ROOT_DIR!;
    const capacitorElectronNodeModuleTemplateDir = join(
      process.env.INIT_CWD!,
      "template"
    );
    const destDir = join(usersProjectDir, "electron");
    const usersProjectCapConfigFile = join(
      usersProjectDir,
      "capacitor.config.ts"
    );

    const configData = JSON.parse(process.env.CAPACITOR_CONFIG!);

    const builtWebAppDir = process.env.CAPACITOR_WEB_DIR!;

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
