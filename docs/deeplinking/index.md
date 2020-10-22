# Deeplinking

The Capacitor Community Electron platform comes with a utility for enabling easy deeplinking for your applications.

## How To Implement

1. Navigate to the `WEB_APP_PROJECT_ROOT/electron/src/index.ts` file in your editor.
2. Import the utility function from `@capacitor-community/electron` like so:

```typescript
import {
  createCapacitorElectronApp,
  createCapacitorElectronDeepinking,
} from "@capacitor-community/electron";
```

3. Make the call after your `createCapacitorElectronApp()` call. For example:

```typescript
...

const myCapacitorApp = createCapacitorElectronApp();

createCapacitorElectronDeepinking(myCapacitorApp, {...});

...
```

4. In the second argument object you will set your configuration. Refer to the chart below.
5. Thats it! See wasnt that easy? 😎

<br/>

## Configuration Options

| Key            | Default | Required | Description                                                                                                                    |
| -------------- | ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| customProtocol | -       | Yes      | The protocol that you want the app to use. For example: 'superapp' will get use as `superapp://testdata`                       |
| customHandler  | _null_  | No       | A custom function that takes 1 parameter `(url: string) => void` that will run in the context of electron and not the web app. |
