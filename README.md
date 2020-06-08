# Capacitor Electron

Capacitor community support for the Electron platform.

<!-- Badges -->
<a href="https://npmjs.com/package/@capacitor-community/electron">
  <img src="https://img.shields.io/npm/v/@capacitor-community/electron.svg">
</a>
<a href="https://npmjs.com/package/@capacitor-community/electron">
  <img src="https://img.shields.io/npm/l/@capacitor-community/electron.svg">
</a>

## Maintainers

| Maintainer | GitHub | Social | Sponsoring Company | Primary  |
| -----------| -------| -------| ------------------ | -------- |
| Mike S. | [IT-MikeS](https://github.com/IT-MikeS) | [@IT_MikeS](https://twitter.com/IT_MikeS) | Volunteer | Yes |
| Max Lynch | [mlynch](https://github.com/mlynch) | [@maxlynch](https://twitter.com/maxlynch) | Ionic | *No* |

Maintenance Status: Actively Maintained

## Usage

More info soon

## Configuration for Popular Frameworks/Libraries

- __Ionic/React__
  1. Add `homepage: "./",` to your apps `package.json`
  2. In `YOUR_APP_ROOT/public/index.html` change the `<base href="/">` to `<base href="./">`

- __Ionic/Angular__
  1. Modify your scripts section entry of `"build": "ng build"` in your apps `package.json` to read as `"build": "ng build --base-href ./"` 

## Using your own image for the Splash Screen

`@capacitor-community/electron` looks in the `splash_assets` folder of the `YOUR_APP_ROOT/electron` folder for a `splash.png` file by default, you can use your own image by using one of the folloing methods:

1. Editing the `splash.png` file directly.
2. Place your own image file into the `splash_assets` folder and pass the `imageFileName` property as part of `splashOptions` into `splashScreen = new CapacitorSplashScreen(mainWindow);`. For example if your image was named `myImage.png` your would pass it like: `splashScreen = new CapacitorSplashScreen(mainWindow, {imageFileName: 'myImage.png'});`
