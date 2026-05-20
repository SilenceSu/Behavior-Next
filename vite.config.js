'use strict';

const path = require('path');
const {
  buildAll,
  isWatchedSource,
  rootDir,
  watchGlobs
} = require('./scripts/legacy-build');

function legacyBuildPlugin() {
  let command = 'serve';
  let rebuild = Promise.resolve();
  let timer = null;

  function runBuild(server, reload) {
    rebuild = rebuild
      .catch(() => undefined)
      .then(() => buildAll({
        production: command === 'build',
        clean: command === 'build'
      }))
      .then(() => {
        if (server && reload) {
          server.ws.send({ type: 'full-reload' });
        }
      })
      .catch((error) => {
        console.error(error);
        if (server) {
          server.ws.send({
            type: 'error',
            err: {
              message: error.message,
              stack: error.stack
            }
          });
        }
      });

    return rebuild;
  }

  function scheduleBuild(server) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      runBuild(server, true);
    }, 100);
  }

  return {
    name: 'behavior3-legacy-build',

    configResolved(config) {
      command = config.command;
    },

    closeBundle() {
      if (command === 'build') {
        return runBuild(null, false);
      }
    },

    configureServer(server) {
      server.watcher.add(watchGlobs.map((pattern) => path.join(rootDir, pattern)));
      server.watcher.on('all', (eventName, filePath) => {
        if (isWatchedSource(filePath)) {
          scheduleBuild(server);
        }
      });

      return () => runBuild(server, false);
    }
  };
}

module.exports = function createConfig(env) {
  const isServe = env.command === 'serve';

  return {
    root: isServe ? 'build' : '.',
    publicDir: false,
    server: {
      host: '127.0.0.1',
      port: 8000,
      strictPort: true
    },
    preview: {
      host: '127.0.0.1',
      port: 8000,
      strictPort: true
    },
    build: {
      outDir: isServe ? path.join(rootDir, 'build/.vite-temp') : path.join(rootDir, 'build'),
      emptyOutDir: false,
      rollupOptions: {
        input: path.join(rootDir, 'scripts/vite-entry.html')
      }
    },
    plugins: [
      legacyBuildPlugin()
    ]
  };
};
