'use strict';

var electron = require('electron');
var contextBridge = electron.contextBridge;
var ipcRenderer = electron.ipcRenderer;
var systemInfo = ipcRenderer.sendSync('b3-get-system-info');

function resolveOpenResult(result) {
  if (!result || result.canceled || !result.filePaths || !result.filePaths.length) {
    return null;
  }

  return result.filePaths;
}

function resolveSaveResult(result) {
  if (!result || result.canceled || !result.filePath) {
    return null;
  }

  return result.filePath;
}

contextBridge.exposeInMainWorld('b3Electron', {
  ok: true,
  system: systemInfo,

  dialog: {
    showOpenDialog: function(options) {
      return ipcRenderer
        .invoke('b3-show-open-dialog', options || {})
        .then(resolveOpenResult);
    },

    showSaveDialog: function(options) {
      return ipcRenderer
        .invoke('b3-show-save-dialog', options || {})
        .then(resolveSaveResult);
    }
  },

  storage: {
    readFile: function(path) {
      return ipcRenderer.invoke('b3-read-file', path);
    },

    writeFile: function(path, content) {
      return ipcRenderer.invoke('b3-write-file', path, content);
    },

    removeFile: function(path) {
      return ipcRenderer.invoke('b3-remove-file', path);
    }
  }
});
