import { dialogService } from '../services/dialog.ts';
import { notificationState } from '../state/notification-state.ts';
import { settingsState } from '../state/settings-state.ts';

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

export var SettingsView = {
  name: 'SettingsView',

  setup: function() {
    return {
      state: settingsState.state,
      numberFields: numberFields,
      colorFields: colorFields
    };
  },

  mounted: function() {
    settingsState.getSettings();
  },

  methods: {
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
              notificationState.success('Settings reseted', 'The editor settings has been updated to default values.');
            });
        });
    }
  },

  template: '' +
    '<form class="b3-editor-form" @submit.prevent="saveSettings">' +
    '  <div class="page">' +
    '    <h1 class="header">Settings</h1>' +
    '    <nav class="page-operations">' +
    '      <div class="page-operations-content">' +
    '        <ul>' +
    '          <li><a class="b3-button b3-button-danger" @click="resetSettings"><i class="fa fa-fw fa-eraser"></i> Reset</a></li>' +
    '          <li><button class="b3-button b3-button-confirm" type="submit"><i class="fa fa-fw fa-check"></i> Save</button></li>' +
    '        </ul>' +
    '      </div>' +
    '    </nav>' +
    '    <div class="content">' +
    '      <h2>Editor</h2>' +
    '      <div class="b3-field b3-layout" v-for="field in numberFields" :key="field.key" :class="{\'b3-field-error\': !state.settings[field.key] || state.settings[field.key] < field.min}">' +
    '        <label :for="field.key" class="b3-span-3 b3-field-label">{{ field.label }}</label>' +
    '        <div class="b3-span-9"><input type="number" class="b3-input" :name="field.key" v-model.number="state.settings[field.key]" :min="field.min" required></div>' +
    '      </div>' +
    '      <div class="b3-field b3-layout">' +
    '        <label for="layout" class="b3-span-3 b3-field-label">Layout</label>' +
    '        <div class="b3-span-9">' +
    '          <label class="b3-radio-choice"><input type="radio" name="layout" value="horizontal" v-model="state.settings.layout"> Horizontal</label>' +
    '          <label class="b3-radio-choice"><input type="radio" name="layout" value="vertical" v-model="state.settings.layout"> Vertical</label>' +
    '        </div>' +
    '      </div>' +
    '      <h2>Colors</h2>' +
    '      <div class="b3-field b3-layout" v-for="field in colorFields" :key="field.key">' +
    '        <label class="b3-span-3 b3-field-label" :for="field.key">{{ field.label }}</label>' +
    '        <div class="b3-span-9"><input type="color" class="b3-input" :name="field.key" v-model="state.settings[field.key]"></div>' +
    '      </div>' +
    '      <br>' +
    '      <div class="b3-field b3-layout"><div class="b3-indent-3 b3-span-9"><button type="submit" class="b3-button b3-button-confirm"><i class="fa fa-fw fa-check"></i> Save</button></div></div>' +
    '    </div>' +
    '  </div>' +
    '</form>'
};
