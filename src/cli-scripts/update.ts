import { join, isAbsolute, resolve, relative } from "path";
import { existsSync, writeFileSync } from "fs";
import { copySync } from "fs-extra";
import {
  readJSON,
  resolvePlugin,
  resolveElectronPlugin,
  runExec
} from "./common";


export async function doUpdate() {
  try {
    const usersProjectDir = process.env.CAPACITOR_ROOT_DIR!;

    const webAppPackageJson = await readJSON(join(usersProjectDir, "package.json"));
    const dependencies = webAppPackageJson.dependencies
      ? webAppPackageJson.dependencies
      : {};
    const devDependencies = webAppPackageJson.devDependencies
      ? webAppPackageJson.devDependencies
      : {};
    const deps = {
      ...dependencies,
      ...devDependencies
    };
    // get all cap plugins installed
    let plugins = await Promise.all(Object.keys(deps).map(async (p) => resolvePlugin(p)));
    // Filter out null returns
    plugins = plugins.filter((p) => !!p);
    // Get only the ones with electron "native" plugins
    let pluginMap: {name: string; path: string | null; installStr: string; id: string}[] = plugins.map((plugin) => {
      let installStr = ""
      // consider cases when package is not installed via npm
      // TODO: add support for packages installed via git etc...
      if(deps[plugin!.id] && deps[plugin!.id].startsWith("file:")) {
        const pkgPath = deps[plugin!.id].replace(/^file:/, "");
        const pkgAbsPath = isAbsolute(pkgPath) ? pkgPath : resolve(usersProjectDir, pkgPath);
        installStr = relative(join(usersProjectDir, "electron"), pkgAbsPath); // try to use relative path as much as possible
      } else installStr = `${plugin!.id}@${plugin!.version}`
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

    let usersProjectCapConfigFile: string | undefined = undefined;
    let configFileName: string | undefined = undefined;
    const configFileOptions = {
      ts: join(usersProjectDir, "capacitor.config.ts"),
      js: join(usersProjectDir, "capacitor.config.js"),
      json: join(usersProjectDir, "capacitor.config.json"),
    }
    if (existsSync(configFileOptions.ts)) {
      usersProjectCapConfigFile = configFileOptions.ts
      configFileName = "capacitor.config.ts"
    } else if (existsSync(configFileOptions.js)) {
      usersProjectCapConfigFile = configFileOptions.js
      configFileName = "capacitor.config.js"
    } else {
      usersProjectCapConfigFile = configFileOptions.json
      configFileName = "capacitor.config.json"
    }
    copySync(usersProjectCapConfigFile, join(usersProjectDir, "electron", configFileName), {overwrite: true});

    if (npmIStr.length > 0) {
      console.log(`\n\nWill install:${npmIStr}\n\n`)
      await runExec(`cd ${join(usersProjectDir, "electron")} && npm i${npmIStr} && npm run rebuild-deps`);
    }
  } catch (e) {
    throw e;
  }
}
