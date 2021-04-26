import { existsSync } from "fs";
import { join } from "path";
import { getCwd, runExec, errorLog } from "./common";

function checkRequirements() {
  const cwd = getCwd();
  const outPaths: {
    errorText: null | string;
    destTemplatePath: null | string;
  } = {
    errorText: null,
    destTemplatePath: null,
  };
  const destDir = join(cwd, "electron");
  if (existsSync(destDir)) {
    outPaths.destTemplatePath = destDir;
  } else {
    outPaths.errorText = "Electron platform does not exist.";
  }
  return outPaths;
}

export async function doOpen() {
  const paths = checkRequirements();
  if (paths.errorText === null) {
    try {
      await runExec(`cd ${paths.destTemplatePath!.replace(/ /g, '\\ ')} && npm run electron:start`);
    } catch (e) {
      errorLog(e.message);
      throw e;
    }
  } else {
    errorLog(paths.errorText);
    throw new Error(paths.errorText);
  }
}
