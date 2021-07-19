import { existsSync, renameSync } from 'fs';
import { copySync } from 'fs-extra';
import { join } from 'path';

import { readJSON, runExec, writePrettyJSON } from './common';

export async function doAdd(): Promise<void> {
  //console.log(process.env.CAPACITOR_ROOT_DIR);
  //console.log(process.env.CAPACITOR_WEB_DIR);
  //console.log(process.env.CAPACITOR_CONFIG);
  const usersProjectDir = process.env.CAPACITOR_ROOT_DIR;
  const capacitorElectronNodeModuleTemplateDir = join(
    usersProjectDir,
    'node_modules',
    '@capacitor-community',
    'electron',
    'template',
  );
  const destDir = join(usersProjectDir, 'electron');
  let usersProjectCapConfigFile: string | undefined = undefined;
  let configFileName: string | undefined = undefined;

  const configFileOptions = {
    ts: join(usersProjectDir, 'capacitor.config.ts'),
    js: join(usersProjectDir, 'capacitor.config.js'),
    json: join(usersProjectDir, 'capacitor.config.json'),
  };
  if (existsSync(configFileOptions.ts)) {
    usersProjectCapConfigFile = configFileOptions.ts;
    configFileName = 'capacitor.config.ts';
  } else if (existsSync(configFileOptions.js)) {
    usersProjectCapConfigFile = configFileOptions.js;
    configFileName = 'capacitor.config.js';
  } else {
    usersProjectCapConfigFile = configFileOptions.json;
    configFileName = 'capacitor.config.json';
  }

  const configData = JSON.parse(process.env.CAPACITOR_CONFIG);

  const builtWebAppDir = process.env.CAPACITOR_WEB_DIR;

  if (!existsSync(destDir)) {
    copySync(capacitorElectronNodeModuleTemplateDir, destDir);
    copySync(usersProjectCapConfigFile, join(destDir, configFileName));
    // writeFileSync(
    //   join(destDir, "capacitor.config.json"),
    //   JSON.stringify(configData)
    // );
    renameSync(join(destDir, 'gitignore'), join(destDir, '.gitignore'));
    copySync(builtWebAppDir, join(destDir, 'app'));

    const appName: string = configData.appName;
    const electronPackageJson = readJSON(join(destDir, 'package.json'));
    const rootPackageJson = readJSON(join(usersProjectDir, 'package.json'));
    electronPackageJson.name = appName;
    if (rootPackageJson.repository) {
      electronPackageJson.repository = rootPackageJson.repository;
    }
    writePrettyJSON(join(destDir, 'package.json'), electronPackageJson);

    await runExec(`cd ${destDir} && npm i`);
  } else {
    throw new Error('Electron platform already exists.');
  }
}
