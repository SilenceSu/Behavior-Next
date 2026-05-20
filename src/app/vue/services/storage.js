import { nodejsService } from './nodejs.js';

var root = window;

function stringify(data) {
  if (typeof data === 'string') {
    return data;
  }

  return root.JSON3 ? root.JSON3.stringify(data) : JSON.stringify(data);
}

function parse(data) {
  try {
    return root.JSON3 ? root.JSON3.parse(data) : JSON.parse(data);
  } catch (e) {
    return data;
  }
}

var localStorageDriver = {
  ok: !!root.localStorage,

  save: function(path, data) {
    root.localStorage[path] = stringify(data);
  },

  load: function(path) {
    return parse(root.localStorage[path]);
  },

  remove: function(path) {
    delete root.localStorage[path];
  }
};

var fileStorageDriver = {
  ok: nodejsService.ok && !!nodejsService.fs,

  save: function(path, data) {
    var content = stringify(data);
    var tempPath = path + '~';
    var file = nodejsService.fs.openSync(tempPath, 'w');
    nodejsService.fs.writeSync(file, content);
    nodejsService.fs.closeSync(file);
    nodejsService.fs.renameSync(tempPath, path);
  },

  load: function(path) {
    return parse(nodejsService.fs.readFileSync(path, 'utf-8'));
  },

  remove: function(path) {
    try {
      nodejsService.fs.unlinkSync(path);
    } catch (e) {}
  }
};

var storage = fileStorageDriver.ok ? fileStorageDriver : localStorageDriver;

export var storageService = {
  save: function(path, data) {
    storage.save(path, data);
  },

  saveAsync: function(path, data) {
    return new Promise(function(resolve, reject) {
      try {
        storage.save(path, data);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },

  load: function(path) {
    return storage.load(path);
  },

  loadAsync: function(path) {
    return new Promise(function(resolve, reject) {
      try {
        resolve(storage.load(path));
      } catch (e) {
        reject(e);
      }
    });
  },

  remove: function(path) {
    storage.remove(path);
  },

  removeAsync: function(path) {
    return new Promise(function(resolve, reject) {
      try {
        storage.remove(path);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }
};
