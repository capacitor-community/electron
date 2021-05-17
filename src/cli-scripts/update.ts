import { join, sep } from "path";
import { copyFileSync, writeFileSync, realpathSync, mkdirSync } from "fs";
import { removeSync } from "fs-extra";
import {
  readJSON,
  resolvePlugin,
  resolveElectronPlugin,
  hashJsFileName,
  getCwd,
  runExec
} from "./common";


export async function doUpdate() {
  try {
    //console.log(process.env.CAPACITOR_ROOT_DIR);
    //console.log(process.env.CAPACITOR_WEB_DIR);
    //console.log(process.env.CAPACITOR_CONFIG);
    const usersProjectDir = process.env.CAPACITOR_ROOT_DIR!;
    //const destDir = join(usersProjectDir, "electron");
    //const configData = JSON.parse(process.env.CAPACITOR_CONFIG!);

    const webAppPackageJson = await readJSON(join(usersProjectDir, "package.json"));
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
    let pluginMap: {name: string; path: string | null; installStr: string; id: string}[] = plugins.map((plugin) => {
      const installStr = `${plugin!.id}@${plugin!.version}`
      const path = resolveElectronPlugin(plugin!)
      const name = plugin!.name
      const id = plugin!.id
      return {name, path, installStr, id}
    }).filter(plugin => plugin.path !== null);

    let npmIStr = ''

    let outStr = `/* eslint-disable @typescript-eslint/no-var-requires */\n`;
    for (const electronPlugin of pluginMap) {
      npmIStr += ` ${electronPlugin.installStr}`
      const tmpPath = join(
        usersProjectDir,
        "electron",
        "node_modules",
        electronPlugin.id,
        "electron",
        "dist/plugin.js"
      )
      outStr += `const ${electronPlugin.name} = require('${tmpPath.replace(/\\/g, '\\\\')}')\n`
    }
    outStr += '\nmodule.exports = {\n'
    for (const electronPlugin of pluginMap) {
      outStr += `  ${electronPlugin.name},\n`
    }
    outStr += '}'

    // console.log('\n' + outStr + '\n\n')

    const capacitorElectronRuntimeFilePath = join(
      usersProjectDir,
      "electron",
      "node_modules",
      "@capacitor-community",
      "electron",
      "dist",
      "runtime"
    );
    
    // console.log(join(capacitorElectronRuntimeFilePath, 'electron-plugins.js'))

    writeFileSync(join(capacitorElectronRuntimeFilePath, 'electron-plugins.js'), outStr, {encoding: 'utf-8'})
    
    if (npmIStr.length > 0) {
      console.log(`\n\nWill install:${npmIStr}\n\n`)
      await runExec(`cd ${join(usersProjectDir, "electron")} && npm i${npmIStr} && npm run rebuild-deps`);
    }
  } catch (e) {
    throw e;
  }
}



export async function doUpdate_OLD() {
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
  let preloaderString = `import '@capacitor/core';`;
  for (const fname of filenames) {
    preloaderString += `import './${fname}';`;
  }
  writeFileSync(join(cwd, "electron", "preloader.ts"), preloaderString, {
    encoding: "utf8",
  });
  return filenames;
}
