import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,           // Generate .d.ts
  minify: false,
  sourcemap: false,
  clean: true,
  outDir: 'dist',
  splitting: false,    // Needed for single-file output
  bundle: true,        // The key option: bundle into one file
});
