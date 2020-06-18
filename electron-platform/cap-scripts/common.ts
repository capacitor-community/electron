const { dirname, join, parse, resolve } = require("path");
import { readFileSync, existsSync } from "fs";
const { exec } = require("child_process");
const { createHash } = require("crypto");
const cwd = process.env.INIT_CWD;

export function getCwd(): string | null {
  // console.log(process.env);
  const _cwd = process.env.INIT_CWD
    ? join(process.env.INIT_CWD, "../", "../", "../")
    : null;
  return _cwd;
}

export function readJSON(pathToUse: string): { [key: string]: any } {
  const data = readFileSync(pathToUse, "utf8");
  return JSON.parse(data);
}

export function runExec(command) {
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

export function fixName(name) {
  name = name
    .replace(/\//g, "_")
    .replace(/-/g, "_")
    .replace(/@/g, "")
    .replace(/_\w/g, (m) => m[1].toUpperCase());

  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function hashJsFileName(filename, slt) {
  const hash = createHash("md5")
    .update(`${Date.now()}-${slt}-${filename}`)
    .digest("hex");
  return `${filename}-${hash}.js`;
}

export function resolveNode(...pathSegments) {
  const id = pathSegments[0];
  const path = pathSegments.slice(1);

  let modulePath;
  const starts = [cwd];
  for (let start of starts) {
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

export function resolveNodeFrom(start, id) {
  const rootPath = parse(start).root;
  let basePath = resolve(start);
  let modulePath;
  while (true) {
    modulePath = join(basePath, "node_modules", id);
    if (existsSync(modulePath)) {
      return modulePath;
    }
    if (basePath === rootPath) {
      return null;
    }
    basePath = dirname(basePath);
  }
}

export async function resolvePlugin(name) {
  try {
    const rootPath = resolveNode(name);
    if (!rootPath) {
      console.error(
        `Unable to find node_modules/${name}. Are you sure ${name} is installed?`
      );
      return null;
    }

    const packagePath = join(rootPath, "package.json");
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
  } catch (e) {}
  return null;
}

export function resolveElectronPlugin(plugin) {
  if (
    plugin.manifest &&
    plugin.manifest.electron &&
    plugin.manifest.electron.src
  ) {
    return join(plugin.rootPath, plugin.manifest.electron.src);
  } else {
    return null;
  }
}

export async function runTask(title, fn) {
  const ora = require("ora");
  const spinner = ora(title).start();
  try {
    const start = process.hrtime();
    let taskInfoMessage;
    const value = await fn((message) => (taskInfoMessage = message));
    const elapsed = process.hrtime(start);
    const chalk = require("chalk");
    if (taskInfoMessage) {
      spinner.info(`${title} ${chalk.dim("– " + taskInfoMessage)}`);
    } else {
      spinner.succeed(`${title} ${chalk.dim("in " + formatHrTime(elapsed))}`);
    }
    return value;
  } catch (e) {
    spinner.fail(`${title}: ${e.message ? e.message : ""}`);
    spinner.stop();
    throw e;
  }
}
const TIME_UNITS = ["s", "ms", "μp"];
function formatHrTime(hrtime) {
  let time = hrtime[0] + hrtime[1] / 1e9;
  let index = 0;
  for (; index < TIME_UNITS.length - 1; index++, time *= 1000) {
    if (time >= 1) {
      break;
    }
  }
  return time.toFixed(2) + TIME_UNITS[index];
}
