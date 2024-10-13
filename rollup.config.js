import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: [
    { file: pkg.module, format: 'es', sourcemap: true },
    { file: pkg.main, format: 'cjs', sourcemap: true },
  ],
  plugins: [
    svelte(),
    resolve(),
    commonjs(),
    terser(), // Minify output for production
  ],
};
