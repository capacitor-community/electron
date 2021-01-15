import { resolve } from "path";
import { pathExists, readJSON } from "@ionic/utils-fs";
//@ts-ignore
import {
  //CONFIG_FILE_NAME_JS,
  //CONFIG_FILE_NAME_JSON,
  CONFIG_FILE_NAME_TS,
  //@ts-ignore
} from "@capacitor/cli/dist/config";
//@ts-ignore
import { resolveNode, requireTS } from "@capacitor/cli/dist/util/node";

export async function customLoadConfig(cwd: string): Promise<any> {
  try {
    const conf = await loadExtConfig(cwd);

    const appId = conf.extConfig.appId ?? "";
    const appName = conf.extConfig.appName ?? "";
    const webDir = conf.extConfig.webDir ?? "www";

    const config: any = {
      app: {
        rootDir: cwd,
        appId,
        appName,
        webDir,
        webDirAbs: resolve(cwd, webDir),
        package: (await tryFn(readJSON, resolve(cwd, "package.json"))) ?? {
          name: appName,
          version: "1.0.0",
        },
        ...conf,
        bundledWebRuntime: conf.extConfig.bundledWebRuntime ?? false,
      },
    };

    // debug('config: %O', config);

    return config;
  } catch (e) {
    throw e;
  }
}

async function loadExtConfig(rootDir: string): Promise<any> {
  const extConfigFilePathTS = resolve(rootDir, CONFIG_FILE_NAME_TS);

  if (await pathExists(extConfigFilePathTS)) {
    return loadExtConfigTS(rootDir, CONFIG_FILE_NAME_TS, extConfigFilePathTS);
  } else {
    throw new Error(
      "Capacitor-Community/Electron currently only supports TS config files."
    );
  }

  /*
  const extConfigFilePathJS = resolve(rootDir, CONFIG_FILE_NAME_JS);

  if (await pathExists(extConfigFilePathJS)) {
    return loadExtConfigJS(CONFIG_FILE_NAME_JS, extConfigFilePathJS);
  }

  const extConfigFilePath = resolve(rootDir, CONFIG_FILE_NAME_JSON);

  return {
    extConfigType: 'json',
    extConfigName: CONFIG_FILE_NAME_JSON,
    extConfigFilePath: extConfigFilePath,
    extConfig: (await tryFn(readJSON, extConfigFilePath)) ?? {},
  };
  */
}

async function loadExtConfigTS(
  rootDir: string,
  extConfigName: string,
  extConfigFilePath: string
): Promise<any> {
  try {
    const tsPath = resolveNode(rootDir, "typescript");

    if (!tsPath) {
      console.error("No Typescript found.");
    }

    const ts = require(tsPath); // eslint-disable-line @typescript-eslint/no-var-requires
    const extConfigObject = requireTS(ts, extConfigFilePath) as any;
    const extConfig = extConfigObject.default ?? extConfigObject;

    return {
      extConfigType: "ts",
      extConfigName,
      extConfigFilePath: extConfigFilePath,
      extConfig,
    };
  } catch (e) {
    throw e;
  }
}

/*
async function loadExtConfigJS(
  extConfigName: string,
  extConfigFilePath: string,
): Promise<any> {
  try {
    return {
      extConfigType: 'js',
      extConfigName,
      extConfigFilePath: extConfigFilePath,
      extConfig: require(extConfigFilePath),
    };
  } catch (e) {
    console.error(`loadExtConfigJS Faild`);
  }
}
*/

const tryFn = async <T extends (...args: any[]) => Promise<R>, R>(
  fn: T,
  ...args: any[]
): Promise<R | null> => {
  try {
    return await fn(...args);
  } catch {
    // ignore
  }

  return null;
};
