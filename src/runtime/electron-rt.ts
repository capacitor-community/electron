import { addPlatform, setPlatform } from "@capacitor/core";

addPlatform("electron", {
  name: "electron",
  getPlatform: () => {
    return "electron";
  },
});

setPlatform("electron");
