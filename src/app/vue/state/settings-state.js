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
  if (root.tine && root.tine.merge) {
    return root.tine.merge({}, defaults, data);
  }

  return Object.assign({}, defaults, data);
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
    if (!state.loaded) {
      var data = null;
      var defaultData = editorBridge.getDefaultSettings();

      try {
        data = storageService.load(settingsPath);
        editorBridge.applySettings(data);
      } catch (e) {}

      if (!data) {
        data = defaultData;
        storageService.save(settingsPath, data);
      }

      replaceSettings(mergeSettings(defaultData, data));
      state.loaded = true;
    }

    return Promise.resolve(state.settings);
  },

  saveSettings: function(settings) {
    editorBridge.applySettings(settings);
    storageService.save(settingsPath, settings);
    replaceSettings(settings);
    return Promise.resolve();
  },

  resetSettings: function() {
    var settings = editorBridge.getDefaultSettings();
    storageService.save(settingsPath, settings);
    replaceSettings(settings);
    editorBridge.applySettings(settings);
    return Promise.resolve(state.settings);
  }
};
