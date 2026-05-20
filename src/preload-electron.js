'use strict';

var ipcRenderer = require('electron').ipcRenderer;

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

window.electronDialog = {
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
};
