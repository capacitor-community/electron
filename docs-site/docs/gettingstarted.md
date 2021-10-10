---
sidebar_position: 1
---

# Getting Started

## Installation into an existing Capacitor application.

**_Note: these instructions require a Capacitor version of ^3.2.0_**

1. Build your webapp in your capacitor initiated project (_'npm run build' for example_).
2. Run `npm i @capacitor-community/electron` in your webapp project directory. This will install the platform for use with the `@capacitor/cli`.
3. Run `npx cap add @capacitor-community/electron` to initiate the platform, this will create the `electron` folder in your webapp project.
4. Run `npx cap open @capacitor-community/electron` to start your app in electron.

**_Note: You can use other `npx cap` commands with the platform by: `npx cap <command> @capacitor-community/electron`_**

<br />

## Changing the default configuration

In the `*yourAppDir*/electron/src/index.ts` you can edit anything you'd like, with V4 a lot of what was hidden in V2 from developers is now exposed to tinker with (or not if you dont want to). However most configuration is done in one of the following files in your apps main directory: `capacitor.config.json`, `capacitor.config.js`, or `capacitor.config.ts`. Please [see config options page for details](/docs/configoptions).
