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
  ok: nodejsService.ok && !!nodejsService.storage,

  save: function(path, data) {
    return this.saveAsync(path, data);
  },

  load: function(path) {
    throw new Error('Synchronous file storage load is not available in Electron renderer.');
  },

  remove: function(path) {
    return this.removeAsync(path);
  },

  saveAsync: function(path, data) {
    return nodejsService.storage.writeFile(path, stringify(data));
  },

  loadAsync: function(path) {
    return nodejsService.storage.readFile(path).then(parse);
  },

  removeAsync: function(path) {
    return nodejsService.storage.removeFile(path);
  }
};

var storage = fileStorageDriver.ok ? fileStorageDriver : localStorageDriver;

export var storageService = {
  save: function(path, data) {
    return storage.save(path, data);
  },

  saveAsync: function(path, data) {
    if (storage.saveAsync) {
      return storage.saveAsync(path, data);
    }

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
    if (storage.loadAsync) {
      return storage.loadAsync(path);
    }

    return new Promise(function(resolve, reject) {
      try {
        resolve(storage.load(path));
      } catch (e) {
        reject(e);
      }
    });
  },

  remove: function(path) {
    return storage.remove(path);
  },

  removeAsync: function(path) {
    if (storage.removeAsync) {
      return storage.removeAsync(path);
    }

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
