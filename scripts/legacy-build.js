'use strict';

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const less = require('less');
const vue = require('@vitejs/plugin-vue');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'build');

const vendorJs = [
  'src/assets/libs/createjs.min.js',
  'node_modules/vue/dist/vue.global.prod.js',
  'node_modules/vue-router/dist/vue-router.global.prod.js'
];

const vendorCss = [];

const vendorFonts = [
  'node_modules/@fortawesome/fontawesome-free/webfonts/*',
  'src/assets/fonts/**/*'
];

const preloadJs = [
  'src/assets/js/preload.ts'
];

const preloadCss = [
  'node_modules/@fortawesome/fontawesome-free/css/all.min.css',
  'node_modules/@fortawesome/fontawesome-free/css/v4-shims.min.css',
  'src/assets/css/preload.css'
];

const appModuleEntry = 'src/main.ts';
const appModuleSources = [
  'src/main.ts',
  'src/start.ts',
  'src/core/**/*.ts',
  'src/modules/**/*.ts',
  'src/editor/**/*.ts',
  'src/app/**/*.ts',
  'src/app/**/*.vue'
];

const appLess = 'src/assets/less/index.less';
const appImgs = ['src/assets/imgs/**/*'];
const appEntry = [
  'src/index.html',
  'src/package.json',
  'src/desktop.ts',
  'src/preload-electron.ts'
];

const watchGlobs = [
  ...vendorJs,
  ...vendorCss,
  ...vendorFonts,
  ...preloadJs,
  ...preloadCss,
  ...appModuleSources,
  appLess,
  'src/assets/less/**/*.less',
  ...appImgs,
  ...appEntry,
  'package.json'
];

function resolveRoot(relativePath) {
  return path.join(rootDir, relativePath);
}

function readText(relativePath) {
  return fs.readFileSync(resolveRoot(relativePath), 'utf8');
}

function writeText(relativePath, content) {
  const target = path.join(outDir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function copyFile(sourceRelativePath, targetRelativePath) {
  const source = resolveRoot(sourceRelativePath);
  const target = path.join(outDir, targetRelativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function unixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function walkFiles(relativeDir) {
  const absoluteDir = resolveRoot(relativeDir);

  if (!fs.existsSync(absoluteDir)) {
    return [];
  }

  const files = [];
  const entries = fs.readdirSync(absoluteDir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const child = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(child));
    } else if (entry.isFile()) {
      files.push(unixPath(child));
    }
  }

  return files;
}

function listFiles(pattern) {
  if (pattern.endsWith('/**/*')) {
    return walkFiles(pattern.slice(0, -5));
  }

  if (pattern.endsWith('/**/*.js')) {
    return walkFiles(pattern.slice(0, -8)).filter((file) => file.endsWith('.js'));
  }

  if (pattern.endsWith('/**/*.ts')) {
    return walkFiles(pattern.slice(0, -8)).filter((file) => file.endsWith('.ts'));
  }

  if (pattern.endsWith('/**/*.html')) {
    return walkFiles(pattern.slice(0, -10)).filter((file) => file.endsWith('.html'));
  }

  if (pattern.endsWith('/*.js')) {
    const directory = pattern.slice(0, -5);
    return walkFiles(directory)
      .filter((file) => path.dirname(file) === directory && file.endsWith('.js'));
  }

  if (pattern.endsWith('/*.ts')) {
    const directory = pattern.slice(0, -5);
    return walkFiles(directory)
      .filter((file) => path.dirname(file) === directory && file.endsWith('.ts'));
  }

  if (pattern.endsWith('/*')) {
    const directory = pattern.slice(0, -2);
    return walkFiles(directory).filter((file) => path.dirname(file) === directory);
  }

  return fs.existsSync(resolveRoot(pattern)) ? [pattern] : [];
}

function expand(patterns) {
  const seen = new Set();
  const files = [];

  for (const pattern of patterns) {
    for (const file of listFiles(pattern)) {
      if (!seen.has(file)) {
        seen.add(file);
        files.push(file);
      }
    }
  }

  return files;
}

function getBuildMetadata() {
  const project = JSON.parse(readText('package.json'));
  return {
    version: project.version,
    date: new Date().toISOString().replace(/T.*/, '')
  };
}

function replaceBuildMetadata(content, metadata) {
  return content
    .replace(/\[BUILD_VERSION\]/g, metadata.version)
    .replace(/\[BUILD_DATE\]/g, metadata.date);
}

function transpileTypeScript(file, source) {
  if (!file.endsWith('.ts')) {
    return source;
  }

  return esbuild.transformSync(source, {
    loader: 'ts',
    target: 'es2018',
    sourcefile: file,
    sourcemap: false
  }).code;
}

function readBuildSource(file, metadata) {
  return transpileTypeScript(file, replaceBuildMetadata(readText(file), metadata));
}

function minifyJs(source, outputName) {
  try {
    return esbuild.transformSync(source, {
      loader: 'js',
      target: 'es2018',
      minify: true
    }).code;
  } catch (error) {
    error.message = `${outputName}: ${error.message}`;
    throw error;
  }
}

function minifyCss(source, outputName) {
  try {
    return esbuild.transformSync(source, {
      loader: 'css',
      minify: true
    }).code;
  } catch (error) {
    error.message = `${outputName}: ${error.message}`;
    throw error;
  }
}

function bundleJs(patterns, outputPath, options) {
  const metadata = options.metadata;
  const source = expand(patterns)
    .map((file) => readBuildSource(file, metadata))
    .join('\n');

  writeText(outputPath, options.minify ? minifyJs(source, outputPath) : source);
}

function legacyTypeScriptPlugin() {
  return {
    name: 'behavior3-typescript',
    transform(code, id) {
      if (!id.endsWith('.ts')) {
        return null;
      }

      return {
        code: transpileTypeScript(id, code),
        map: null
      };
    }
  };
}

async function buildAppModule(outputPath, options) {
  const metadata = options.metadata;
  const production = !!options.production;
  const rollupModule = await import('rollup');
  const bundle = await rollupModule.rollup({
    input: resolveRoot(appModuleEntry),
    external: ['vue'],
    treeshake: {
      moduleSideEffects: true
    },
    plugins: [
      legacyTypeScriptPlugin(),
      vue(),
      {
        name: 'behavior3-build-metadata',
        transform(code, id) {
          if (!id.startsWith(rootDir)) {
            return null;
          }

          return {
            code: replaceBuildMetadata(code, metadata),
            map: null
          };
        }
      }
    ]
  });

  try {
    const generated = await bundle.generate({
      format: 'iife',
      name: 'BehaviorNextApp',
      exports: 'named',
      globals: {
        vue: 'Vue'
      },
      generatedCode: 'es5',
      compact: production
    });
    const code = generated.output
      .filter((item) => item.type === 'chunk')
      .map((item) => item.code)
      .join('\n');

    writeText(outputPath, production ? minifyJs(code, outputPath) : code);
  } finally {
    await bundle.close();
  }
}

function bundleCss(patterns, outputPath) {
  const source = expand(patterns).map(readText).join('\n');
  writeText(outputPath, minifyCss(source, outputPath));
}

async function buildLess(outputPath) {
  const sourcePath = resolveRoot(appLess);
  const rendered = await less.render(readText(appLess), {
    filename: sourcePath,
    paths: [path.dirname(sourcePath)]
  });

  writeText(outputPath, minifyCss(rendered.css, outputPath));
}

function minifyHtml(source) {
  return source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function copyImages() {
  for (const file of expand(appImgs)) {
    copyFile(file, file.replace(/^src\/assets\//, ''));
  }
}

function copyFonts() {
  for (const file of expand(vendorFonts)) {
    if (file.startsWith('node_modules/@fortawesome/fontawesome-free/webfonts/')) {
      copyFile(file, `webfonts/${path.basename(file)}`);
    } else if (file.startsWith('src/assets/fonts/')) {
      copyFile(file, file.replace(/^src\/assets\//, ''));
    }
  }
}

function copyEntryFiles(metadata) {
  for (const file of appEntry) {
    const outputName = path.basename(file).replace(/\.ts$/, '.js');
    writeText(outputName, readBuildSource(file, metadata));
  }
}

async function buildAll(options) {
  const config = Object.assign({ production: false, clean: true }, options);
  const metadata = getBuildMetadata();

  if (config.clean) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }

  bundleJs(vendorJs, 'js/vendor.min.js', { metadata, minify: true });
  bundleCss(vendorCss, 'css/vendor.min.css');
  copyFonts();
  bundleJs(preloadJs, 'js/preload.min.js', { metadata, minify: true });
  bundleCss(preloadCss, 'css/preload.min.css');
  await buildAppModule('js/app.min.js', {
    metadata,
    production: config.production
  });
  await buildLess('css/app.min.css');
  copyImages();
  copyEntryFiles(metadata);
}

function isWatchedSource(filePath) {
  const relativePath = unixPath(path.relative(rootDir, filePath));

  if (relativePath.startsWith('..')) {
    return false;
  }

  return relativePath === 'package.json' || relativePath.startsWith('src/');
}

if (require.main === module) {
  const production = process.argv.includes('--production');

  buildAll({ production })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

module.exports = {
  buildAll,
  isWatchedSource,
  watchGlobs,
  rootDir,
  outDir
};
