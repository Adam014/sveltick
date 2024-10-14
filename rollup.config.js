import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';  // Handle CommonJS dependencies
import { terser } from 'rollup-plugin-terser';  // Minification for production
import pkg from './package.json';

export default {
  input: 'src/index.js',  // Entry point for your library
  output: [
    {
      file: pkg.module,  // ESM output
      format: 'es',
      sourcemap: true
    },
    {
      file: pkg.main,  // CommonJS output
      format: 'cjs',
      sourcemap: true,
      exports: 'auto'
    }
  ],
  plugins: [
    svelte(),  // Compile Svelte components
    resolve({
      browser: true  // Ensure we resolve browser-specific modules
    }),
    commonjs(),  // Convert CommonJS to ESM
    terser()  // Minify for production
  ]
};
