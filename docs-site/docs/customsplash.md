---
sidebar_position: 2
---

# Custom Splashscreen

`@capacitor-community/electron` looks in the `YOUR_APP_ROOT/electron/assets` folder for a `splash.png` file by default, but you can use your own image by using one of the following methods:

1. Editing the `splash.png` file directly.
2. Place your own image file (even `.gif`) into the `assets` folder (for example: `mySplash.gif`) and change/add the property `splashScreenImageName: 'mySplash.gif'` to the `electron` property in your `capacitor.config` file
