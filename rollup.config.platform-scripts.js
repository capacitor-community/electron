import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

const banner =
  "/*! Capacitor-Community: https://github.com/capacitor-community - MIT License */";

export default {
  input: "build/index.js",
  output: {
    file: "dist/platform-scripts/cap-scripts.js",
    format: "cjs",
    sourcemap: false,
    banner,
  },
  plugins: [nodeResolve(), commonjs(), json()],
};
