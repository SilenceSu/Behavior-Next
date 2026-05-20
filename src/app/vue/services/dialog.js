import { nodejsService } from './nodejs.js';

var root = window;

function callSwal(options, mapValue) {
  return new Promise(function(resolve, reject) {
    root.swal(options, function(value) {
      if (mapValue) {
        mapValue(value, resolve, reject);
      } else {
        resolve(value);
      }
    });
  });
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
    options = options || {};
    options.title = title;
    options.text = text;
    options.type = type;
    options.customClass = type;

    return callSwal(options);
  },

  confirm: function(title, text, type, options) {
    options = options || {};
    options.title = title;
    options.text = text;
    options.type = type;
    options.customClass = type;
    options.showCancelButton = true;

    return callSwal(options, function(ok, resolve, reject) {
      ok ? resolve() : reject();
    });
  },

  prompt: function(title, text, type, placeholder, options) {
    options = options || {};
    options.title = title;
    options.text = text;
    options.type = type || 'input';
    options.inputPlaceholder = placeholder;
    options.customClass = type;
    options.showCancelButton = true;

    return callSwal(options, function(value, resolve, reject) {
      value !== false ? resolve(value) : reject(value);
    });
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
