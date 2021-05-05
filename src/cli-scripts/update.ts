import { join, sep } from "path";
import { copyFileSync, writeFileSync, realpathSync, mkdirSync } from "fs";
import { removeSync } from "fs-extra";
import {
  readJSON,
  resolvePlugin,
  resolveElectronPlugin,
  hashJsFileName,
  getCwd,
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
    let pluginMap: {name: string; path: string | null}[] = plugins.map((plugin) => {
      const path = resolveElectronPlugin(plugin!)
      const name = plugin!.name
      return {name, path}
    }).filter(plugin => plugin.path !== null);

    let outStr = `/* eslint-disable @typescript-eslint/no-var-requires */\n`;
    for (const electronPlugin of pluginMap) {
      outStr += `const ${electronPlugin.name} = require('${electronPlugin.path!.replace(/\\/g, '\\\\')}')\n`
    }
    outStr += '\nmodule.exports = {\n'
    for (const electronPlugin of pluginMap) {
      outStr += `  ${electronPlugin.name},\n`
    }
    outStr += '}'

    console.log('\n' + outStr + '\n\n')

    const capacitorElectronRuntimeFilePath = join(
      usersProjectDir,
      "electron",
      "node_modules",
      "@capacitor-community",
      "electron",
      "dist",
      "runtime"
    );

    /*
    let rtFileContents = readFileSync(capacitorElectronRuntimeFilePath, {encoding: 'utf-8'}).toString()

    console.log(rtFileContents + '\n\n')

    rtFileContents = rtFileContents.replace(/(\/\/--S--\/\/\n\/\/--E--\/\/)|(\/\/--S--\/\/\n(.|\n)*\n\/\/--E--\/\/)/g, outStr)

    console.log(rtFileContents + '\n\n')
    */
    
    console.log(join(capacitorElectronRuntimeFilePath, 'electron-plugins.js'))

    writeFileSync(join(capacitorElectronRuntimeFilePath, 'electron-plugins.js'), outStr, {encoding: 'utf-8'})

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
