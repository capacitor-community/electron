import chalk from 'chalk';
import { exec } from 'child_process';
import { createHash } from 'crypto';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { dirname, join, parse, resolve } from 'path';

const enum PluginType {
  Core,
  Cordova,
  Incompatible,
}
interface PluginManifest {
  electron: {
    src: string;
  };
  ios: {
    src: string;
    doctor?: any[];
  };
  android: {
    src: string;
  };
}
interface Plugin {
  id: string;
  name: string;
  version: string;
  rootPath: string;
  manifest?: PluginManifest;
  repository?: any;
  xml?: any;
  ios?: {
    name: string;
    type: PluginType;
    path: string;
  };
  android?: {
    type: PluginType;
    path: string;
  };
}

export function errorLog(message: string): void {
  console.log(chalk.red(`Error: ${message}`));
}

export function getCwd(): string {
  const _cwd = process.env.INIT_CWD;
  return _cwd;
}

export function readJSON(pathToUse: string): { [key: string]: any } {
  const data = readFileSync(pathToUse, 'utf8');
  return JSON.parse(data);
}

export function runExec(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stdout + stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

export function fixName(name: string): string {
  name = name
    .replace(/\//g, '_')
    .replace(/-/g, '_')
    .replace(/@/g, '')
    .replace(/_\w/g, m => m[1].toUpperCase());

  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function hashJsFileName(filename: string, slt: number): string {
  const hash = createHash('md5')
    .update(`${Date.now()}-${slt}-${filename}`)
    .digest('hex');
  return `${filename}-${hash}.js`;
}

export function resolveNode(...pathSegments: string[]): string {
  const id = pathSegments[0];
  const path = pathSegments.slice(1);

  let modulePath;
  const starts = [getCwd()];
  for (const start of starts) {
    modulePath = resolveNodeFrom(start, id);
    if (modulePath) {
      break;
    }
  }
  if (!modulePath) {
    return null;
  }

  return join(modulePath, ...path);
}

export function writePrettyJSON(path: string, data: any): void {
  return writeFileSync(path, JSON.stringify(data, null, '  ') + '\n');
}

export function resolveNodeFrom(start: string, id: string): string | null {
  const rootPath = parse(start).root;
  let basePath = resolve(start);
  let modulePath;
  while (true) {
    modulePath = join(basePath, 'node_modules', id);
    if (existsSync(modulePath)) {
      return modulePath;
    }
    if (basePath === rootPath) {
      return null;
    }
    basePath = dirname(basePath);
  }
}

export async function resolvePlugin(name: string): Promise<{
  id: string;
  name: string;
  version: any;
  rootPath: string;
  repository: any;
  manifest: any;
}> {
  try {
    const rootPath = resolveNode(name);
    if (!rootPath) {
      console.error(
        `Unable to find node_modules/${name}. Are you sure ${name} is installed?`,
      );
      return null;
    }

    const packagePath = join(rootPath, 'package.json');
    const meta = await readJSON(packagePath);
    if (!meta) {
      return null;
    }
    if (meta.capacitor) {
      return {
        id: name,
        name: fixName(name),
        version: meta.version,
        rootPath: rootPath,
        repository: meta.repository,
        manifest: meta.capacitor,
      };
    }
  } catch (e) {
    return null;
  }
}

export function resolveElectronPlugin(plugin: Plugin): string | null {
  if (plugin.manifest?.electron?.src) {
    return join(
      plugin.rootPath,
      plugin.manifest.electron.src,
      'dist/plugin.js',
    );
  } else {
    return null;
  }
}

type TaskInfoProvider = (messsage: string) => void;

export async function runTask<T>(
  title: string,
  fn: (info: TaskInfoProvider) => Promise<T>,
): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ora = require('ora');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const chalk = require('chalk');
  const spinner = ora(title).start();
  try {
    const start = process.hrtime();
    let taskInfoMessage;
    const value = await fn((message: string) => (taskInfoMessage = message));
    const elapsed = process.hrtime(start);
    if (taskInfoMessage) {
      spinner.info(`${title} ${chalk.dim('– ' + taskInfoMessage)}`);
    } else {
      spinner.succeed(`${title} ${chalk.dim('in ' + formatHrTime(elapsed))}`);
    }
    return value;
  } catch (e) {
    spinner.fail(`${title}: ${e.message ? e.message : ''}`);
    spinner.stop();
    throw e;
  }
}

const TIME_UNITS = ['s', 'ms', 'μp'];

function formatHrTime(hrtime: any) {
  let time = hrtime[0] + hrtime[1] / 1e9;
  let index = 0;
  for (; index < TIME_UNITS.length - 1; index++, time *= 1000) {
    if (time >= 1) {
      break;
    }
  }
  return time.toFixed(2) + TIME_UNITS[index];
}
