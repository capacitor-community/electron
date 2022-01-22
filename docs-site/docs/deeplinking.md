---
sidebar_position: 3
---

# Deeplinking

The Capacitor Community Electron platform comes with a utility for enabling easy deeplinking for your applications.

## How To Implement

1. Enable deeplinking by adding the property `deepLinkingEnabled: true` to your `capacitor.config` file under the `electron` property.
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
2. If you don't want to use the default `deepLinkingCustomProtocol` value of `mycapacitorapp`, specify any custom protocol.
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
3. From here you will need a plugin to handle the deep linking inside your webapp. The official `App` plugin from Capacitor will handle this for example.
