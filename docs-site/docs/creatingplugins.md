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

  export class DialogElectron implements DialogPlugin {
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
9. Add your electron implementation to the `<root>/src/index.ts` where your web implementation is registered:
  ```typescript
  const Dialog = registerPlugin<DialogPlugin>('Dialog', {
    web: () => import('./web').then(m => new m.DialogWeb()),
    electron: () => (window as any).CapacitorCustomPlatform.plugins.DialogElectron
  });
  ```

10. Modify the main `package.json` in the root directory, add an entry into the `files` array of the following:
  `electron/`
11.  Modify the main `package.json` in the root directory, add an entry into the `scripts` object of the following:
  `"build-electron": "tsc --project electron/tsconfig.json && rollup -c electron/rollup.config.js && rimraf ./electron/build",`
12.  Modify the main `package.json` in the root directory, edit the `build` entry in the `scripts` object to be the following:
  `"build": "npm run clean && npm run docgen && tsc && rollup -c rollup.config.js && npm run build-electron",`
13.  Run the `build` npm script to build your plugin.
14.  Release it to NPM then use in your capacitor apps as any other native plugin like android or ios. (dont forget to use `npx cap sync/copy/update/open @capacitor-community/electron`)


### Check out the `plugin-example` folder in the repo for a small demo plugin.

## Events
If you want to emit events from your plugin, your class has to extend the [NodeJS event emitter class](https://nodejs.org/api/events.html#events_class_eventemitter). This is used by Capacitor Electron to determine if it should expose the `addListener` & `removeListener` functions to the Electron runtime plugin.

```typescript
import { EventEmitter } from 'events';

export default class MyPlugin extends EventEmitter {
  constructor() {
    setInterval(() => {
      this.emit('my-event', 'You successfully listened to the 10sec event!');     
    }, 10_000);
  }
}
```

In your client code you can do the following:
```typescript
const id = CapacitorCustomPlatform.plugins.MyPlugin.addListener('my-event', console.log);

// SOME CODE

CapacitorCustomPlatform.plugins.MyPlugin.removeListener(id);
```

## Config
Plugins get access to the `capacitor.config.ts` config object as the first argument to the constructor. E.g.:
```typescript
export default class App {
  private config?: Record<string, any>;

  constructor(config?: Record<string, any>) {
    this.config = config;
  }

  getLaunchUrl(): string | undefined {
    const url = this.config?.server?.url;
    
    return url ? { url } : undefined;
  }
}
```

**Keep in mind that the config could possibly be `undefined`.**
