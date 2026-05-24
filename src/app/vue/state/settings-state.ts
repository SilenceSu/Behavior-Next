import { systemService } from '../services/system.ts';
import { storageService } from '../services/storage.ts';
import { editorBridge } from '../services/editor-bridge.ts';

var root = window;

// 画布配色预设包，仅覆盖颜色字段，不影响布局/吸附等其他设置。
// 通过 settingsState.applyCanvasTheme(name) 手动触发，不与 UI 主题联动。
export var CANVAS_THEMES = {
  dark: {
    label: 'Dark',
    background_color:        '#171717',
    selection_color:         '#4BB2FD',
    connection_color:        '#6D6D6D',
    block_border_color:      '#5A5A5A',
    block_symbol_color:      '#CCCCCC',
    anchor_background_color: '#888888',
    root_color:              '#4A90D9',
    composite_color:         '#5A8A5A',
    decorator_color:         '#8A6A9A',
    tree_color:              '#6A6A9A',
    action_color:            '#8A7A4A',
    condition_color:         '#4A8A8A'
  },
  light: {
    label: 'Light',
    background_color:        '#F0F0F0',
    selection_color:         '#1A7FD4',
    connection_color:        '#888888',
    block_border_color:      '#AAAAAA',
    block_symbol_color:      '#333333',
    anchor_background_color: '#CCCCCC',
    root_color:              '#2A70B9',
    composite_color:         '#3A6A3A',
    decorator_color:         '#6A4A7A',
    tree_color:              '#4A4A7A',
    action_color:            '#6A5A2A',
    condition_color:         '#2A6A6A'
  },
  midnight: {
    label: 'Midnight',
    background_color:        '#0D1117',
    selection_color:         '#58A6FF',
    connection_color:        '#484F58',
    block_border_color:      '#30363D',
    block_symbol_color:      '#C9D1D9',
    anchor_background_color: '#6E7681',
    root_color:              '#1F6FEB',
    composite_color:         '#238636',
    decorator_color:         '#8957E5',
    tree_color:              '#388BFD',
    action_color:            '#D29922',
    condition_color:         '#1F8B8B'
  },
  solarized: {
    label: 'Solarized',
    background_color:        '#002B36',
    selection_color:         '#268BD2',
    connection_color:        '#586E75',
    block_border_color:      '#073642',
    block_symbol_color:      '#93A1A1',
    anchor_background_color: '#657B83',
    root_color:              '#268BD2',
    composite_color:         '#859900',
    decorator_color:         '#D33682',
    tree_color:              '#2AA198',
    action_color:            '#B58900',
    condition_color:         '#2AA198'
  }
};

var state = root.Vue.reactive({
  settings: {},
  theme: 'dark',
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

// 将主题名写入 <html data-theme="...">，同时切换 Element Plus 暗色模式（html.dark class）。
function applyThemeToDom(theme) {
  var html = root.document.documentElement;
  html.dataset.theme = theme === 'light' ? 'light' : 'dark';

  // Element Plus 官方暗色模式通过 html.dark class 触发
  if (theme === 'light') {
    html.classList.remove('dark');
  } else {
    html.classList.add('dark');
  }
}

export var settingsState = {
  state: state,

  // 应用画布配色预设，只合并颜色字段到当前设置并立即生效，不持久化。
  // 用户可在预览后手动点 Save 保存。
  applyCanvasTheme: function(themeName) {
    var preset = CANVAS_THEMES[themeName];
    if (!preset) {
      return;
    }

    var colorKeys = Object.keys(preset).filter(function(k) { return k !== 'label'; });
    colorKeys.forEach(function(key) {
      state.settings[key] = preset[key];
    });

    editorBridge.applySettings(state.settings);
  },

  // 切换 UI 主题并持久化到 settings.json。
  setTheme: function(theme) {
    state.theme = theme;
    applyThemeToDom(theme);
    var data = root.b3e.runtime.merge({}, state.settings, { theme: theme });
    return storageService.saveAsync(settingsPath, data).catch(function() {});
  },

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

        // 恢复上次保存的主题，默认深色
        var savedTheme = data.theme || 'dark';
        state.theme = savedTheme;
        applyThemeToDom(savedTheme);

        state.loaded = true;
        return state.settings;
      });
  },

  saveSettings: function(settings) {
    editorBridge.applySettings(settings);
    // 保存时携带当前主题字段
    var data = root.b3e.runtime.merge({}, settings, { theme: state.theme });
    return storageService.saveAsync(settingsPath, data).then(function() {
      replaceSettings(settings);
      return state.settings;
    });
  },

  resetSettings: function() {
    var settings = editorBridge.getDefaultSettings();
    editorBridge.applySettings(settings);
    // 重置时保留当前主题选择
    var data = root.b3e.runtime.merge({}, settings, { theme: state.theme });
    return storageService.saveAsync(settingsPath, data).then(function() {
      replaceSettings(settings);
      return state.settings;
    });
  }
};
