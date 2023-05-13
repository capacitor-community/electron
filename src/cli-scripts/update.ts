import { existsSync, writeFileSync } from 'fs';
import { copySync } from 'fs-extra';
import { join, isAbsolute, resolve, relative } from 'path';

import type { TaskInfoProvider, Plugin } from './common';
import { getPlugins, readJSON, resolveElectronPlugin, runExec } from './common';

export async function doUpdate(taskInfoMessageProvider: TaskInfoProvider): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const usersProjectDir = process.env.CAPACITOR_ROOT_DIR!;

  const userProjectPackageJsonPath = join(usersProjectDir, 'package.json');

  const webAppPackageJson = await readJSON(userProjectPackageJsonPath);
  const dependencies = webAppPackageJson.dependencies ? webAppPackageJson.dependencies : {};
  const devDependencies = webAppPackageJson.devDependencies ? webAppPackageJson.devDependencies : {};
  const deps = {
    ...dependencies,
    ...devDependencies,
  };

  taskInfoMessageProvider('searching for plugins');

  //console.log(`\n\n${userProjectPackageJsonPath}\n\n`);

  // get all cap plugins installed
  const plugins = await getPlugins(userProjectPackageJsonPath);
  //console.log('\n\n');
  //console.log(plugins);
  //console.log('\n');

  // Get only the ones with electron "native" plugins
  const pluginMap: {
    name: string;
    path: string | null;
    installStr: string;
    id: string;
  }[] = plugins
    .filter((plugin: Plugin | null): plugin is Plugin => plugin !== null)
    .map((plugin: Plugin) => {
      const installStr: string = (() => {
        // Consider cases when package is not installed via npm
        if (deps[plugin?.id]) {
          if (deps[plugin.id].startsWith('file:')) {
            const pkgPath = deps[plugin?.id].replace(/^file:/, '');
            const pkgAbsPath = isAbsolute(pkgPath) ? pkgPath : resolve(usersProjectDir, pkgPath);

            return relative(join(usersProjectDir, 'electron'), pkgAbsPath); // try to use relative path as much as possible
          } else if (deps[plugin.id].match(/^(https?|git):/)) {
            return deps[plugin.id];
          }
        }

        return `${plugin?.id}@${plugin?.version}`;
      })();

      const path = resolveElectronPlugin(plugin);
      const name = plugin?.name;
      const id = plugin?.id;
      return { name, path, installStr, id };
    })
    .filter((plugin) => plugin.path !== null);

  let npmIStr = '';

  //console.log('\n');
  //console.log(pluginMap);
  //console.log('\n');

  taskInfoMessageProvider('generating electron-plugins.js');

  const capacitorElectronRuntimeFilePath = join(usersProjectDir, 'electron', 'src', 'rt');

  let outStr = `/* eslint-disable @typescript-eslint/no-var-requires */\n`;
  for (const electronPlugin of pluginMap) {
    npmIStr += ` ${electronPlugin.installStr}`;
    const tmpPath = join(
      relative(capacitorElectronRuntimeFilePath, usersProjectDir),
      'node_modules',
      electronPlugin.id,
      'electron',
      'dist/plugin.js'
    );
    outStr += `const ${electronPlugin.name} = require('${tmpPath.replace(/\\/g, '\\\\')}');\n`;
  }
  outStr += '\nmodule.exports = {\n';
  for (const electronPlugin of pluginMap) {
    outStr += `  ${electronPlugin.name},\n`;
  }
  outStr += '}';

  writeFileSync(join(capacitorElectronRuntimeFilePath, 'electron-plugins.js'), outStr, { encoding: 'utf-8' });

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
  copySync(usersProjectCapConfigFile, join(usersProjectDir, 'electron', configFileName), { overwrite: true });

  if (npmIStr.length > 0) {
    taskInfoMessageProvider('installing electron plugin files');
    console.log(`\n\nWill install:${npmIStr}\n\n`);
    await runExec(`cd ${join(usersProjectDir, 'electron')} && npm i${npmIStr}`);
  }
}
