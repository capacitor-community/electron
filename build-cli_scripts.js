require('esbuild').build({
  entryPoints: ['src/cli-scripts/index.ts'],
  bundle: true,
  outfile: 'dist/cli-scripts/cap-scripts.js',
  platform: 'node',
  target: 'node14',
  minify: true,
  external: [
    'child_process',
    'fs',
    'path',
    'fs-extra',
    'crypto',
    'chalk',
    'ora'
  ]
}).catch(() => process.exit(1))