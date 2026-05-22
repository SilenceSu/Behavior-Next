import { nodejsService } from './nodejs.ts';
import { dialogState } from '../state/dialog-state.ts';

function getDialogConfig(title, text, type, options) {
  options = options || {};

  return {
    title: typeof options.title === 'undefined' ? title : options.title,
    text: typeof options.text === 'undefined' ? text : options.text,
    type: type || options.type || options.customClass || 'default',
    placeholder: options.inputPlaceholder || options.placeholder || '',
    defaultValue: options.inputValue || options.defaultValue || '',
    confirmButtonText: options.confirmButtonText || 'OK',
    cancelButtonText: options.cancelButtonText || 'Cancel',
    showCancelButton: options.showCancelButton
  };
}

function normalizeDialogResult(value, multiple) {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return multiple ? value : value[0];
  }

  if (value.filePaths) {
    if (!value.filePaths.length) {
      return null;
    }
    return multiple ? value.filePaths : value.filePaths[0];
  }

  if (value.filePath) {
    return value.filePath;
  }

  return value;
}

function resolveMaybePromise(value, resolve, reject, multiple) {
  if (value && typeof value.then === 'function') {
    value.then(function(result) {
      var normalized = normalizeDialogResult(result, multiple);
      normalized ? resolve(normalized) : reject();
    }, reject);
    return;
  }

  var normalized = normalizeDialogResult(value, multiple);
  normalized ? resolve(normalized) : reject();
}

export var dialogService = {
  alert: function(title, text, type, options) {
    return dialogState.alert(getDialogConfig(title, text, type, options));
  },

  confirm: function(title, text, type, options) {
    var config = getDialogConfig(title, text, type, options);
    config.showCancelButton = true;
    return dialogState.confirm(config);
  },

  prompt: function(title, text, type, placeholder, options) {
    var config = getDialogConfig(title, text, type || 'input', options);
    config.placeholder = placeholder || config.placeholder;
    config.showCancelButton = true;
    return dialogState.prompt(config);
  },

  saveAs: function(placeholder) {
    return new Promise(function(resolve, reject) {
      if (!nodejsService.dialog) {
        reject();
        return;
      }

      var value = nodejsService.dialog.showSaveDialog({
        title: 'Save project as...',
        defaultPath: (placeholder || 'behavior-tree') + '.b3',
        filters: [
          { name: 'Behavior3 File', extensions: ['b3', 'json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      resolveMaybePromise(value, resolve, reject, false);
    });
  },

  openFile: function(multiple) {
    return new Promise(function(resolve, reject) {
      if (!nodejsService.dialog) {
        reject();
        return;
      }

      var value = nodejsService.dialog.showOpenDialog({
        title: 'Open file...',
        multiSelections: multiple,
        properties: ['openFile'],
        filters: [
          { name: 'Behavior3 File', extensions: ['b3', 'json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      resolveMaybePromise(value, resolve, reject, multiple);
    });
  },

  openDirectory: function() {
    return new Promise(function(resolve, reject) {
      if (!nodejsService.dialog) {
        reject();
        return;
      }

      var value = nodejsService.dialog.showOpenDialog({
        title: 'Open directory...',
        properties: ['openDirectory']
      });

      resolveMaybePromise(value, resolve, reject, false);
    });
  }
};
