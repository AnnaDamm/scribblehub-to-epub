const esbuild = require('esbuild');
const inlineImportPlugin = require('esbuild-plugin-inline-import');

(async () => {
  const options = {
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'dist/index.js',
    platform: 'node',
    sourcemap: true,
    minify: process.argv.includes('--minify'),
    plugins: [
      inlineImportPlugin(), // Always include this plugin before others
    ]
  };

  if (process.argv.includes('--watch')) {
    const context = await esbuild.context(options);
    await context.watch().catch(() => process.exit(1));
  } else {
    await esbuild.build(options)
  }
})();


