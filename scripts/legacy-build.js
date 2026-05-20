'use strict';

const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');
const less = require('less');
const vue = require('@vitejs/plugin-vue');
const UglifyJS = require('uglify-js');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'build');

const vendorJs = [
  'src/assets/libs/createjs.min.js',
  'src/assets/libs/creatine-1.0.0.min.js',
  'src/assets/libs/behavior3js-0.1.0.min.js',
  'src/assets/libs/mousetrap.min.js',
  'node_modules/vue/dist/vue.global.prod.js',
  'node_modules/vue-router/dist/vue-router.global.prod.js',
  'node_modules/sweetalert/dist/sweetalert.min.js'
];

const vendorCss = [
  'node_modules/bootstrap/dist/css/bootstrap.min.css',
  'node_modules/sweetalert/dist/sweetalert.css'
];

const vendorFonts = [
  'node_modules/font-awesome/fonts/*',
  'src/assets/fonts/**/*'
];

const preloadJs = [
  'src/assets/js/preload.js'
];

const preloadCss = [
  'node_modules/font-awesome/css/font-awesome.min.css',
  'src/assets/css/preload.css'
];

const appModuleEntry = 'src/main.js';
const appModuleSources = [
  'src/main.js',
  'src/start.js',
  'src/modules/**/*.js',
  'src/editor/**/*.js',
  'src/app/**/*.js',
  'src/app/**/*.vue'
];

const appLess = 'src/assets/less/index.less';
const appImgs = ['src/assets/imgs/**/*'];
const appEntry = [
  'src/index.html',
  'src/package.json',
  'src/desktop.js',
  'src/preload-electron.js'
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

  if (pattern.endsWith('/**/*.html')) {
    return walkFiles(pattern.slice(0, -10)).filter((file) => file.endsWith('.html'));
  }

  if (pattern.endsWith('/*.js')) {
    const directory = pattern.slice(0, -5);
    return walkFiles(directory)
      .filter((file) => path.dirname(file) === directory && file.endsWith('.js'));
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

function minifyJs(source, outputName) {
  const result = UglifyJS.minify(source);

  if (result.error) {
    result.error.message = `${outputName}: ${result.error.message}`;
    throw result.error;
  }

  return result.code;
}

function bundleJs(patterns, outputPath, options) {
  const metadata = options.metadata;
  const source = expand(patterns)
    .map((file) => replaceBuildMetadata(readText(file), metadata))
    .join('\n');

  writeText(outputPath, options.minify ? minifyJs(source, outputPath) : source);
}

async function buildAppModule(outputPath, options) {
  const metadata = options.metadata;
  const production = !!options.production;
  const rollupModule = await import('rollup');
  const bundle = await rollupModule.rollup({
    input: resolveRoot(appModuleEntry),
    treeshake: {
      moduleSideEffects: true
    },
    plugins: [
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
      name: 'Behavior3EditorApp',
      exports: 'named',
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
  const result = new CleanCSS({ rebase: false }).minify(source);

  if (result.errors.length) {
    throw new Error(`${outputPath}: ${result.errors.join(', ')}`);
  }

  writeText(outputPath, result.styles);
}

async function buildLess(outputPath) {
  const sourcePath = resolveRoot(appLess);
  const rendered = await less.render(readText(appLess), {
    filename: sourcePath,
    paths: [path.dirname(sourcePath)]
  });
  const result = new CleanCSS({ rebase: false }).minify(rendered.css);

  if (result.errors.length) {
    throw new Error(`${outputPath}: ${result.errors.join(', ')}`);
  }

  writeText(outputPath, result.styles);
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
    if (file.startsWith('node_modules/font-awesome/fonts/')) {
      copyFile(file, `fonts/${path.basename(file)}`);
    } else if (file.startsWith('src/assets/fonts/')) {
      copyFile(file, file.replace(/^src\/assets\//, ''));
    }
  }
}

function copyEntryFiles(metadata) {
  for (const file of appEntry) {
    const outputName = path.basename(file);
    writeText(outputName, replaceBuildMetadata(readText(file), metadata));
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
