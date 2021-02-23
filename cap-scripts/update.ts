import { join, sep } from "path";
import { copyFileSync, writeFileSync, realpathSync, mkdirSync } from "fs";
import { existsSync, removeSync } from "fs-extra";
import {
  readJSON,
  resolvePlugin,
  resolveElectronPlugin,
  hashJsFileName,
  getCwd,
} from "./common";

export async function doUpdate() {
  const cwd = getCwd();
  if (cwd === null) throw new Error("CWD ERROR");
  const webAppPackageJson = await readJSON(join(cwd, "package.json"));
  const dependencies = webAppPackageJson.dependencies
    ? webAppPackageJson.dependencies
    : {};
  const devDependencies = webAppPackageJson.devDependencies
    ? webAppPackageJson.devDependencies
    : {};
  const deps = Object.keys(dependencies).concat(Object.keys(devDependencies));
  // get all cap plugins installed
  let plugins = await Promise.all(deps.map(async (p) => resolvePlugin(p)));
  // Filter out null returns
  plugins = plugins.filter((p) => !!p);
  // Get only the ones with electron "native" plugins
  let pluginPaths = plugins.map((plugin) => resolveElectronPlugin(plugin!));
  // Filter out nulls
  pluginPaths = pluginPaths.filter((pluginPath) => !!pluginPath);
  // Now have list of paths to rollupJs files of electron plugins to use in preload
  const copyToPath = join(cwd, "electron", "plugins");
  removeSync(copyToPath);
  mkdirSync(copyToPath);
  const filenames = [];
  for (let i = 0; i < pluginPaths.length; i++) {
    const path = `${pluginPaths[i]}`;
    let filename = path.substr(path.lastIndexOf(sep) + 1);
    filename = hashJsFileName(filename, i);
    copyFileSync(realpathSync(path), join(copyToPath, filename));
    filenames.push(filename);
  }
  let preloaderString = `require('./node_modules/@capacitor-community/electron/dist/electron-bridge.js');`;
  for (const fname of filenames) {
    preloaderString += `require('./plugins/${fname}');`;
  }
  if (existsSync(join(cwd, "electron", "user-preload-script.js"))) {
    preloaderString += `require('./user-preload-script.js');`;
  }
  writeFileSync(join(cwd, "electron", "preloader.js"), preloaderString, {
    encoding: "utf8",
  });
  return filenames;
}
