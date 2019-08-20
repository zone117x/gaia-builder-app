const path = require('path');
const resolve = require('rollup-plugin-node-resolve');
const typescript = require('rollup-plugin-typescript');

const isDev = process.env.BUILD === 'development';

const opts = {
  input: path.resolve(__dirname, 'src/index.ts'),
  output: {
    dir: path.resolve(__dirname, 'dist'),
    format: 'esm',
    chunkFileNames: '[name].js',
  },
  plugins: [
    typescript({ module: 'es2015' }),
    resolve()
  ]
};

if (isDev) {
  const serve = require('rollup-plugin-serve');
  opts.plugins.push(serve({
    contentBase: '',
    open: true,
  }))
}

module.exports = opts;
