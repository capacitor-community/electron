import nodeResolve from 'rollup-plugin-node-resolve';

const banner = '/*! Capacitor-Community: https://github.com/capacitor-community - MIT License */';

export default {
  input: 'dist/esm/index.js',
  output: {
    file: 'dist/electron-bridge.js',
    format: 'iife',
    name: 'capacitorExports',
    sourcemap: true,
    banner,
  },
  plugins: [
    nodeResolve()
  ]
};