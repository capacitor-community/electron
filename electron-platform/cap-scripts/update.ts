const { basename, dirname, join, parse, resolve } = require("path");
const { readFileAsync, readFileSync, existsSync } = require("fs");
const cwd = process.env.INIT_CWD;

async function readJSON(path: string): Promise<any> {
  const data = await readFileAsync(path, "utf8");
  return JSON.parse(data);
}
function fixName(name: string): string {
  name = name
    .replace(/\//g, "_")
    .replace(/-/g, "_")
    .replace(/@/g, "")
    .replace(/_\w/g, (m) => m[1].toUpperCase());

  return name.charAt(0).toUpperCase() + name.slice(1);
}

async function doUpdate() {
  const webAppPackageJson = await readJSON(join(cwd, "package.json"));
  return await runTask("Updating Electron plugins", async () => {
    const dependencies = webAppPackageJson.dependencies
      ? webAppPackageJson.dependencies
      : {};
    const devDependencies = webAppPackageJson.devDependencies
      ? webAppPackageJson.devDependencies
      : {};
    const deps = Object.keys(dependencies).concat(Object.keys(devDependencies));
    let plugins = await Promise.all(deps.map(async (p) => resolvePlugin(p)));
    plugins = plugins.filter((p) => !!p);

    let pluginPaths = plugins.map((plugin) => resolveElectronPlugin(plugin));
    pluginPaths = pluginPaths.filter((pluginPath) => !!pluginPath);

    //Copy these js files into a path to be used in the preload function.
    return pluginPaths;
  });
}

function resolveNode(...pathSegments: any[]) {
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
function resolveNodeFrom(start: string, id: string) {
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
async function resolvePlugin(name) {
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
async function resolveElectronPlugin(plugin) {
  if (plugin.manifest && plugin.manifest.electron) {
    return join(plugin.rootPath, "electron", "dist", "index.js");
  } else {
    return null;
  }
}
async function runTask<T>(title: string, fn: (info) => Promise<T>): Promise<T> {
  const ora = require("ora");
  const spinner = ora(title).start();
  try {
    const start = process.hrtime();
    let taskInfoMessage;
    const value = await fn((message: string) => (taskInfoMessage = message));
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
function formatHrTime(hrtime: any) {
  let time = (hrtime[0] + hrtime[1] / 1e9) as number;
  let index = 0;
  for (; index < TIME_UNITS.length - 1; index++, time *= 1000) {
    if (time >= 1) {
      break;
    }
  }
  return time.toFixed(2) + TIME_UNITS[index];
}

////////////////////////////////////////////////////////////////////
(() => {
  doUpdate();
})();
