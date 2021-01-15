import { runTask } from "./common";
import { doUpdate } from "./update";
import { doAdd } from "./add";
import { doCopy } from "./copy";
import { doOpen } from "./open";

async function doUpdateTask() {
  return await runTask("Updating Electron plugins", async () => {
    return await doUpdate();
  });
}

async function doAddTask() {
  return await runTask("Adding Electron platform", async () => {
    return doAdd();
  });
}

async function doCopyTask() {
  return await runTask("Copying Web App to Electron platform", async () => {
    return await doCopy();
  });
}

async function doOpenTask() {
  return await runTask("Opening Electron platform", async () => {
    return await doOpen();
  });
}

(async () => {
  const scriptToRun = process.argv[2] ? process.argv[2] : null;
  if (scriptToRun !== null) {
    switch (scriptToRun) {
      case "add":
        await doAddTask();
        // await doUpdateTask();
        break;
      case "copy":
        await doCopyTask();
        break;
      case "open":
        await doOpenTask();
        break;
      case "update":
        await doUpdateTask();
        break;
      case "sync":
        await doCopyTask();
        await doUpdateTask();
        break;
      default:
        throw new Error(`Invalid script chosen: ${scriptToRun}`);
    }
  } else {
    throw new Error(`Invalid script chosen: ${scriptToRun}`);
  }
})();
