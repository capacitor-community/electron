---
sidebar_position: 5
---

# Create a Capacitor Electron Plugin

1. Create or open a Capacitor V3 compatible plugin in your editor of choice.
2. Create a folder named `electron` in the root of this plugin, with a sub-folder of `src` in it.
3. Create a ts file in the above `src` folder named `index.ts` and either paste in the following example code of the `@capacitor/dialog` plugin and edit away, or create your own from scratch:
  ```typescript
  import { dialog } from 'electron'

  import type {
    DialogPlugin,
    AlertOptions,
    PromptOptions,
    PromptResult,
    ConfirmOptions,
    ConfirmResult,
  } from '../../src/definitions';

  export class Dialog implements DialogPlugin {
    async alert(options: AlertOptions): Promise<void> {
      await dialog.showMessageBox({message: options.message + ' --- electron'});
    }

    async prompt(options: PromptOptions): Promise<PromptResult> {
      const val = window.prompt(options.message, options.inputText || '');
      return {
        value: val !== null ? val : '',
        cancelled: val === null,
      };
    }

    async confirm(options: ConfirmOptions): Promise<ConfirmResult> {
      const val = window.confirm(options.message);
      return {
        value: val,
      };
    }
  }
  ```
4. Create a `.gitignore` file in the `electron` folder with the following:
  ```
  dist
  ```
5. Create a `.npmignore` file in the `electron` folder with the following:
  ```
  src
  ```
6. Create a `rollup.config.js` file in the `electron` folder with the following:
  ```javascript
  export default {
    input: 'electron/build/electron/src/index.js',
    output: [
      {
        file: 'electron/dist/plugin.js',
        format: 'cjs',
        sourcemap: true,
        inlineDynamicImports: true,
      },
    ],
    external: ['@capacitor/core'],
  };
  ```
7. Create a `tsconfig.json` file in the `electron` folder with the following:
  ```json
  {
    "compilerOptions": {
      "allowSyntheticDefaultImports": true,
      "declaration": true,
      "experimentalDecorators": true,
      "noEmitHelpers": true,
      "importHelpers": true,
      "lib": ["dom", "es2020"],
      "module": "commonjs",
      "noImplicitAny": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "outDir": "build",
      "sourceMap": true,
      "strict": false,
      "target": "ES2017"
    },
    "include": ["src/**/*"]
  }
  ```
8. Modify the main `package.json` in the root directory, add a property to the `capacitor` object so it reflects the following (android and ios shown for example only):
  ```json
  "capacitor": {
    "ios": {
      "src": "ios"
    },
    "android": {
      "src": "android"
    },
    "electron": {
      "src": "electron"
    }
  },
  ```
9. Modify the main `package.json` in the root directory, add an entry into the `files` array of the following:
  `electron/`
10. Modify the main `package.json` in the root directory, add an entry into the `scripts` object of the following:
  `"build-electron": "tsc --project electron/tsconfig.json && rollup -c electron/rollup.config.js && rimraf ./electron/build",`
11. Modify the main `package.json` in the root directory, edit the `build` entry in the `scripts` object to be the following:
  `"build": "npm run clean && npm run docgen && tsc && rollup -c rollup.config.js && npm run build-electron",`
12. Run the `build` npm script to build your plugin.
13. Release it to NPM then use in your capacitor apps as any other native plugin like android or ios. (dont forget to use `npx cap sync/copy/update/open @capacitor-community/electron`)


### Check out the `plugin-example` folder in the repo for a small demo plugin.
