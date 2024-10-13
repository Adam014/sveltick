import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
  ],
  plugins: [
    svelte({
      compilerOptions: {
        hydratable: true, // Enable hydration for SSR compatibility
      },
    }),
    resolve({
      browser: false, // Disable browser-specific resolution for SSR
      preferBuiltins: true, // Prefer Node.js built-in modules for SSR
    }),
    commonjs(),
    terser(), // Minify the output for production
  ],
  external: [...Object.keys(pkg.dependencies || {})],
};
