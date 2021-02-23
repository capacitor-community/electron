import { existsSync, renameSync, readFileSync, writeFileSync } from "fs";
import { copySync } from "fs-extra";
import { join } from "path";
import { readJSON, runExec, writePrettyJSON } from "./common";

export async function doAdd() {
  try {
    // console.log(process.env.CAPACITOR_ROOT_DIR);
    // console.log(process.env.CAPACITOR_WEB_DIR);
    // console.log(process.env.CAPACITOR_CONFIG);
    const usersProjectDir = process.env.CAPACITOR_ROOT_DIR!;
    const capacitorElectronNodeModuleTemplateDir = join(
      usersProjectDir,
      "node_modules",
      "@capacitor-community",
      "electron",
      "template"
    );
    const destDir = join(usersProjectDir, "electron");
    // const usersProjectCapConfigFile = join(
    //   usersProjectDir,
    //   "capacitor.config.ts"
    // );

    const configData = JSON.parse(readFileSync(process.env.CAPACITOR_CONFIG!).toString());

    const builtWebAppDir = process.env.CAPACITOR_WEB_DIR!;

    if (!existsSync(destDir)) {
      copySync(capacitorElectronNodeModuleTemplateDir, destDir);
      // copySync(usersProjectCapConfigFile, join(destDir, "capacitor.config.ts"));
      writeFileSync(
        join(destDir, "capacitor.config.json"),
        JSON.stringify(configData)
      );
      renameSync(join(destDir, "gitignore"), join(destDir, ".gitignore"));
      copySync(builtWebAppDir, join(destDir, "app"));

      const appName: string = configData.appName!;
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
