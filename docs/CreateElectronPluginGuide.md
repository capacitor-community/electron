# How to create a Capacitor Electron Plugin.

1. Generate plugin starter with `npx @capacitor/cli plugin:generate`.
2. Run `npm i -D rollup rollup-plugin-node-resolve electron @types/node@^12.0.0 tslib@^1.13.0` in the new project directory created by the CLI.
3. Create a `electron` folder in the root of the new project directory created by the CLI.
4. Create a `tsconfig.json` file containing the below in the `electron` folder.
   ```json
   {
     "compilerOptions": {
       "allowSyntheticDefaultImports": true,
       "declaration": true,
       "experimentalDecorators": true,
       "noEmitHelpers": true,
       "importHelpers": true,
       "moduleResolution": "node",
       "lib": ["dom", "es2020"],
       "module": "es2020",
       "noImplicitAny": true,
       "noUnusedLocals": true,
       "noUnusedParameters": true,
       "outDir": "dist/esm",
       "sourceMap": true,
       "target": "es2015"
     },
     "files": ["src/index.ts"]
   }
   ```
5. Create a `rollup.config.js` file containing the below `electron` folder.
   ```javascript
   import nodeResolve from "rollup-plugin-node-resolve";
   export default {
     input: "dist/esm/electron/src/index.js",
     output: {
       file: "dist/plugin.js",
       format: "iife",
       name: "capacitorPlugin",
       sourcemap: true,
     },
     plugins: [nodeResolve()],
   };
   ```
6. Create a `src` folder in the `electron` folder.
7. Create an `index.ts` file in the new `src` folder, containing:
   ```typescript
   export * from "./definitions";
   export * from "./plugin";
   ```
8. Create a `definitions.ts` file in the new `src` folder, containing:
   ```typescript
   export * from "../../src/definitions";
   ```
9. Create a `plugin.ts` file in the new `src` folder, containing:

   ```typescript
   import { WebPlugin } from "@capacitor/core";
   import { AwesomeElectornPluginPlugin } from "./definitions";
   const { remote } = require("electron");

   export class AwesomeElectronPluginWeb extends WebPlugin
     implements AwesomeElectornPluginPlugin {
     Path: any = null;
     NodeFs: any = null;
     RemoteRef: any = null;

     constructor() {
       super({
         name: "AwesomeElectronPlugin",
         platforms: ["electron"],
       });
       console.log("AwesomeElectronPlugin");
       this.RemoteRef = remote;
       this.Path = require("path");
       this.NodeFs = require("fs");
     }

     async echo(options: { value: string }): Promise<{ value: string }> {
       console.log("ECHO", options);
       console.log(this.RemoteRef);
       return options;
     }
   }

   const AwesomeElectronPlugin = new AwesomeElectronPluginWeb();

   export { AwesomeElectronPlugin };

   import { registerWebPlugin } from "@capacitor/core";
   registerWebPlugin(AwesomeElectronPlugin);
   ```

10. Edit the `package.json` in the root folder, add the below to the `capacitor` object:
    ```json
    "electron": {
      "src": "electron/dist/plugin.js"
    }
    ```
11. Edit the `package.json` in the root folder `scripts` object to reflect the below:
    ```json
    "scripts": {
      ...,
      "build-electron": "rimraf ./electron/dist && cd ./electron && tsc && rollup --config rollup.config.js"
    }
    ```
12. Edit the `"files": [...]` in the root `package.json`, add `"electron/"` to the list.
13. Create your plugin in `plugin.ts`.
14. Run `npm run build-electron` to compile the plugin.
15. Release it to NPM then use in your capacitor apps as any other native plugin like android or ios.
