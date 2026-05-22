import { systemService } from '../services/system.js';
import { storageService } from '../services/storage.js';
import { editorBridge } from '../services/editor-bridge.js';

var root = window;
var state = root.Vue.reactive({
  settings: {},
  loaded: false
});

var settingsPath = systemService.join(systemService.getDataPath(), 'settings.json');

function mergeSettings(defaults, data) {
  return root.b3e.runtime.merge({}, defaults, data);
}

function replaceSettings(settings) {
  Object.keys(state.settings).forEach(function(key) {
    delete state.settings[key];
  });
  Object.keys(settings).forEach(function(key) {
    state.settings[key] = settings[key];
  });
}

export var settingsState = {
  state: state,

  getSettings: function() {
    if (state.loaded) {
      return Promise.resolve(state.settings);
    }

    var defaultData = editorBridge.getDefaultSettings();

    return storageService
      .loadAsync(settingsPath)
      .catch(function() {
        return null;
      })
      .then(function(data) {
        if (data) {
          try {
            editorBridge.applySettings(data);
            return data;
          } catch (e) {
            data = null;
          }
        }

        data = defaultData;
        return storageService
          .saveAsync(settingsPath, data)
          .catch(function() {})
          .then(function() {
            return data;
          });
      })
      .then(function(data) {
        if (!data) {
          data = defaultData;
        }

        replaceSettings(mergeSettings(defaultData, data));
        state.loaded = true;
        return state.settings;
      });
  },

  saveSettings: function(settings) {
    editorBridge.applySettings(settings);
    return storageService.saveAsync(settingsPath, settings).then(function() {
      replaceSettings(settings);
      return state.settings;
    });
  },

  resetSettings: function() {
    var settings = editorBridge.getDefaultSettings();
    editorBridge.applySettings(settings);
    return storageService.saveAsync(settingsPath, settings).then(function() {
      replaceSettings(settings);
      return state.settings;
    });
  }
};
