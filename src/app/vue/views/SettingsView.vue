<script lang="ts">
import { dialogService } from '../services/dialog.ts';
import { notificationState } from '../state/notification-state.ts';
import { settingsState, CANVAS_THEMES } from '../state/settings-state.ts';

var numberFields = [
  { key: 'snap_x', label: 'Snap X', min: 1 },
  { key: 'snap_y', label: 'Snap Y', min: 1 },
  { key: 'anchor_radius', label: 'Anchor radius', min: 5 }
];

var colorFields = [
  { key: 'background_color', label: 'Background' },
  { key: 'selection_color', label: 'Selection' },
  { key: 'connection_color', label: 'Connection' },
  { key: 'block_border_color', label: 'Border' },
  { key: 'block_symbol_color', label: 'Symbol' },
  { key: 'anchor_background_color', label: 'Anchor' },
  { key: 'root_color', label: 'Root' },
  { key: 'decorator_color', label: 'Decorator' },
  { key: 'composite_color', label: 'Composite' },
  { key: 'tree_color', label: 'Tree' },
  { key: 'action_color', label: 'Action' },
  { key: 'condition_color', label: 'Condition' }
];

// 预览色块取这几个颜色代表整套配色
var previewKeys = ['background_color', 'root_color', 'composite_color', 'action_color', 'condition_color'];

var canvasThemeOptions = Object.keys(CANVAS_THEMES).map(function(key) {
  var preset = CANVAS_THEMES[key];
  return {
    value: key,
    label: preset.label,
    preview: previewKeys.map(function(k) { return preset[k]; })
  };
});

export default {
  name: 'SettingsView',

  setup: function() {
    return {
      state: settingsState.state,
      numberFields: numberFields,
      colorFields: colorFields,
      canvasThemeOptions: canvasThemeOptions
    };
  },

  mounted: function() {
    settingsState.getSettings();
  },

  methods: {
    onThemeChange: function() {
      settingsState.setTheme(this.state.theme);
    },

    onCanvasThemeApply: function(themeName) {
      if (!themeName) return;
      settingsState.applyCanvasTheme(themeName);
      notificationState.info(
        'Canvas preset applied',
        'Click Save to persist the changes.'
      );
    },

    saveSettings: function() {
      settingsState
        .saveSettings(this.state.settings)
        .then(function() {
          notificationState.success('Settings saved', 'The editor settings has been updated.');
        });
    },

    resetSettings: function() {
      dialogService
        .confirm('Reset Settings?', 'Are you sure you want to reset to the default settings?')
        .then(function() {
          settingsState
            .resetSettings()
            .then(function() {
              notificationState.success('Settings reset', 'The editor settings has been updated to default values.');
            });
        });
    }
  }
};
</script>

<template>
<div class="page">
  <h1 class="header">Settings</h1>
  <nav class="page-operations">
    <div class="page-operations-content">
      <ul>
        <li>
          <el-button type="danger" @click="resetSettings">
            <i class="fa fa-fw fa-eraser"></i> Reset
          </el-button>
        </li>
        <li>
          <el-button type="success" @click="saveSettings">
            <i class="fa fa-fw fa-check"></i> Save
          </el-button>
        </li>
      </ul>
    </div>
  </nav>
  <div class="content">

    <el-card class="settings-card">
      <template #header><strong>Editor</strong></template>
      <el-form label-position="right" label-width="140px">
        <el-form-item
          v-for="field in numberFields"
          :key="field.key"
          :label="field.label"
          :error="(!state.settings[field.key] || state.settings[field.key] < field.min) ? 'Value too low' : ''"
        >
          <el-input-number
            v-model="state.settings[field.key]"
            :min="field.min"
            :name="field.key"
            controls-position="right"
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="Layout">
          <el-radio-group v-model="state.settings.layout">
            <el-radio-button value="horizontal">Horizontal</el-radio-button>
            <el-radio-button value="vertical">Vertical</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="settings-card" style="margin-top: 16px;">
      <template #header><strong>Theme</strong></template>
      <el-form label-position="right" label-width="140px">
        <el-form-item label="UI Preset">
          <el-radio-group v-model="state.theme" @change="onThemeChange">
            <el-radio-button value="dark">Dark</el-radio-button>
            <el-radio-button value="light">Light</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="settings-card" style="margin-top: 16px;">
      <template #header><strong>Canvas Colors</strong></template>
      <el-form label-position="right" label-width="140px">

        <!-- 预设选择器 -->
        <el-form-item label="Preset">
          <el-select
            placeholder="Apply a preset..."
            style="width: 200px"
            @change="onCanvasThemeApply"
          >
            <el-option
              v-for="opt in canvasThemeOptions"
              :key="opt.value"
              :value="opt.value"
              :label="opt.label"
            >
              <span style="display: flex; align-items: center; gap: 6px;">
                <span
                  v-for="color in opt.preview"
                  :key="color"
                  :style="{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '2px',
                    background: color,
                    border: '1px solid rgba(255,255,255,0.15)'
                  }"
                ></span>
                <span>{{ opt.label }}</span>
              </span>
            </el-option>
          </el-select>
          <el-text type="info" size="small" style="margin-left: 10px;">
            Applies immediately, save to persist
          </el-text>
        </el-form-item>

        <el-divider />

        <!-- 逐个颜色微调 -->
        <el-form-item v-for="field in colorFields" :key="field.key" :label="field.label">
          <el-color-picker v-model="state.settings[field.key]" />
          <span style="margin-left: 8px; font-size: 12px; opacity: 0.6;">{{ state.settings[field.key] }}</span>
        </el-form-item>

      </el-form>
    </el-card>

    <div style="margin-top: 20px; padding-bottom: 20px;">
      <el-button type="success" @click="saveSettings">
        <i class="fa fa-fw fa-check"></i> Save Settings
      </el-button>
    </div>

  </div>
</div>
</template>
