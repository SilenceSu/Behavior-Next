import { dialogService } from '../../services/dialog.js';
import { editorBridge } from '../../services/editor-bridge.js';
import { storageService } from '../../services/storage.js';
import { systemService } from '../../services/system.js';
import { notificationState } from '../../state/notification-state.js';

var root = window;

function stringify(data, pretty) {
  if (root.JSON3) {
    return pretty ? root.JSON3.stringify(data, null, 2) : root.JSON3.stringify(data);
  }
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

export var ExportModal = {
  name: 'ExportModal',

  data: function() {
    return {
      type: '',
      format: '',
      compact: '',
      pretty: '',
      result: '',
      hideCompact: false,
      isDesktop: systemService.isDesktop
    };
  },

  mounted: function() {
    this.createExport();
  },

  watch: {
    '$route.params': function() {
      this.createExport();
    }
  },

  methods: {
    createExport: function() {
      this.type = this.$route.params.type;
      this.format = this.$route.params.format;

      var exporter = editorBridge.getEditor().export;
      var data = null;
      if (this.type === 'project' && this.format === 'json') {
        data = exporter.projectToData();
      } else if (this.type === 'tree' && this.format === 'json') {
        data = exporter.treeToData();
      } else if (this.type === 'nodes' && this.format === 'json') {
        data = exporter.nodesToData();
      }

      this.compact = stringify(data, false);
      this.pretty = stringify(data, true);
      this.result = this.pretty;
    },

    select: function() {
      var range = document.createRange();
      range.selectNodeContents(document.getElementById('export-result'));
      var selection = root.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    },

    save: function() {
      var self = this;
      dialogService
        .saveAs(null, ['.b3', '.json'])
        .then(function(path) {
          storageService
            .saveAsync(path, self.pretty)
            .then(function() {
              notificationState.success('File saved', 'The file has been saved successfully.');
            });
        });
    },

    close: function() {
      this.$router.push('/editor');
    }
  },

  template: '' +
    '<div class="b3modal">' +
    '  <div class="b3modal-background" @click="close"></div>' +
    '  <div class="b3modal-window">' +
    '    <div class="b3modal-wrap">' +
    '      <h1 class="b3modal-title">Export {{ type }} as {{ format }}</h1>' +
    '      <div class="b3modal-content"><pre id="export-result">{{ result || "Loading..." }}</pre></div>' +
    '    </div>' +
    '    <div class="b3modal-buttons">' +
    '      <button class="b3-button b3-button-neutral b3-button-large b3-float-left b3-gap-right" @click="select">Select result</button>' +
    '      <button class="b3-button b3-button-neutral b3-button-large b3-float-left b3-gap-right" v-if="!hideCompact && result !== compact" @click="result = compact">Compact</button>' +
    '      <button class="b3-button b3-button-neutral b3-button-large b3-float-left b3-gap-right" v-if="!hideCompact && result !== pretty" @click="result = pretty">Pretty</button>' +
    '      <button class="b3-button b3-button-neutral b3-button-large b3-float-left" v-if="isDesktop" @click="save">Save</button>' +
    '      <button class="b3-button b3-button-accent b3-button-large" @click="close">Ok</button>' +
    '    </div>' +
    '  </div>' +
    '</div>'
};
