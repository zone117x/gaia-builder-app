const path = require('path');
const resolve = require('rollup-plugin-node-resolve');
const typescript = require('rollup-plugin-typescript');

module.exports = {
  input: path.resolve(__dirname, 'src/index.ts'),
  output: {
    file: path.resolve(__dirname, 'dist/main.js'),
    format: 'esm'
  },
  plugins: [
    typescript({ module: 'es2015' }),
    resolve()
  ]
};
