const { dirname, join, parse, resolve, sep } = require("path");
const {
  rmdirSync,
  readFileSync,
  existsSync,
  copyFileSync,
  writeFileSync,
  realpathSync,
  mkdirSync,
} = require("fs");
const { createHash } = require("crypto");
const cwd = process.env.INIT_CWD;

//////////////////////////////////////////////////////////////////////
async function readJSON(path) {
  const data = readFileSync(path, "utf8");
  return JSON.parse(data);
}
function fixName(name) {
  name = name
    .replace(/\//g, "_")
    .replace(/-/g, "_")
    .replace(/@/g, "")
    .replace(/_\w/g, (m) => m[1].toUpperCase());

  return name.charAt(0).toUpperCase() + name.slice(1);
}

/////////////////////////////////////////////////////////////////////
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
    // get all cap plugins installed
    let plugins = await Promise.all(deps.map(async (p) => resolvePlugin(p)));
    // Filter out null returns
    plugins = plugins.filter((p) => !!p);
    // Get only the ones with electron "native" plugins
    let pluginPaths = plugins.map((plugin) => resolveElectronPlugin(plugin));
    // Filter out nulls
    pluginPaths = pluginPaths.filter((pluginPath) => !!pluginPath);
    // Now have list of paths to rollupJs files of electron plugins to use in preload
    const copyToPath = join(cwd, "electron", "plugins");
    rmdirSync(copyToPath, { recursive: true });
    mkdirSync(copyToPath);
    const filenames = [];
    for (let i = 0; i < pluginPaths.length; i++) {
      // console.log(pluginPaths[i] + ' --------');
      const path = `${pluginPaths[i]}`;
      let filename = path.substr(path.lastIndexOf(sep) + 1);
      filename = hashJsFileName(filename, i);
      copyFileSync(realpathSync(path), join(copyToPath, filename));
      filenames.push(filename);
    }
    let preloaderString = `require('./node_modules/@capacitor-community/electron-core/dist/electron-bridge.js');`;
    for (const fname of filenames) {
      preloaderString += `require('./plugins/${fname}');`;
    }
    writeFileSync(join(cwd, "electron", "preloader.js"), preloaderString, {
      encoding: "utf8",
    });

    //Copy these js files into a path to be used in the preload function.
    return filenames;
  });
}
function hashJsFileName(filename, slt) {
  const hash = createHash("md5")
    .update(`${Date.now()}-${slt}-${filename}`)
    .digest("hex");
  return `${filename}-${hash}.js`;
}
function resolveNode(...pathSegments) {
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
function resolveNodeFrom(start, id) {
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
function resolveElectronPlugin(plugin) {
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
async function runTask(title, fn) {
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

////////////////////////////////////////////////////////////////////
(() => {
  doUpdate();
})();
