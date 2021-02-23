import { existsSync } from "fs";
import { copySync, removeSync } from "fs-extra";
import { errorLog } from "./common";
import { join } from "path";

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
