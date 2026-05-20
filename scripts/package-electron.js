'use strict';

const fs = require('fs');
const path = require('path');
const packager = require('@electron/packager');
const { buildAll, rootDir } = require('./legacy-build');

async function packageElectron() {
  const project = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  const distDir = path.join(rootDir, 'dist');

  await buildAll({ production: true });
  fs.rmSync(distDir, { recursive: true, force: true });

  await packager({
    dir: path.join(rootDir, 'build'),
    out: distDir,
    name: project.name,
    platform: 'linux,win32',
    arch: 'all',
    electronVersion: '33.2.0',
    overwrite: true,
    asar: true
  });
}

packageElectron()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
