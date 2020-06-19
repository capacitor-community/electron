import nodeResolve from "rollup-plugin-node-resolve";

const banner =
  "/*! Capacitor-Community: https://github.com/capacitor-community - MIT License */";

export default {
  input: "build/index.js",
  output: {
    file: "dist/cap-scripts.js",
    format: "cjs",
    name: "capacitorExports",
    sourcemap: true,
    banner,
  },
  plugins: [nodeResolve()],
};
