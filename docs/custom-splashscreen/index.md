# Using a Custom Splashscreen

`@capacitor-community/electron` looks in the `YOUR_APP_ROOT/electron/assets` folder for a `splash.png` file by default, but you can use your own image by using one of the following methods:

1. Editing the `splash.png` file directly.
2. Place your own image file into the `assets` folder and pass the `imageFilePath` property as part of `splashScreen -> splashOptions` into `createCapacitorElectronApp(config)`. For example if your image was named `myImage.gif` (yes animated GIF's are valid) you would pass it like this:

```typescript
  import {app, ......} from 'electron';
  import * as path from 'path';

  .....

  const myCapacitorApp = createCapacitorElectronApp({
    splashScreen: {
      splashOptions: {
        imageFilePath: path.join(app.getAppPath(), "assets", "myImage.gif")
      }
    }
  });
```
