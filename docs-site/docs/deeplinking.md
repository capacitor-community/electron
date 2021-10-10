---
sidebar_position: 3
---

# Deeplinking

The Capacitor Community Electron platform comes with a utility for enabling easy deeplinking for your applications.

## How To Implement

1. Enable deepliking by adding the property `deepLinkingEnabled: true` to your capacitor.config file under the `electron` property.
```typescript
...
const config = {
  appId: 'com.company.appname',
  appName: 'My Capacitor App',
  webDir: 'www',
  electron: {
    deepLinkingEnabled: true,
  }
};
...
```
2. If you dont want your app to use the default custom protocol of `mycapacitorapp` you will need to add another property to the `electron` prop. in the config file of: `deepLinkingCustomProtocol: 'mycustomprotocol'` where you can set anything you wish as the custom protocol.
```typescript
...
const config = {
  appId: 'com.company.appname',
  appName: 'My Capacitor App',
  webDir: 'www',
  electron: {
    deepLinkingEnabled: true,
    deepLinkingCustomProtocol: 'mycustomprotocol',
  }
};
...
```
3. From here you will need a plugin to handle the deep linking inside your webapp. The official `App` plugin from capacitor will handle this for example.