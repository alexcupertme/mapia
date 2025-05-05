import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  minify: false,
  sourcemap: false,
  clean: true,
  outDir: 'dist',
  splitting: false,
  bundle: true,
  outExtension({ format }) {
    return format === 'cjs' ? { js: '.cjs' } : { js: '.mjs' };
  },

});
