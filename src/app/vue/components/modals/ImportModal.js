import { dialogService } from '../../services/dialog.js';
import { editorBridge } from '../../services/editor-bridge.js';
import { storageService } from '../../services/storage.js';
import { systemService } from '../../services/system.js';
import { notificationState } from '../../state/notification-state.js';

var root = window;

function parse(data) {
  return root.JSON3 ? root.JSON3.parse(data) : JSON.parse(data);
}

function stringify(data) {
  return root.JSON3 ? root.JSON3.stringify(data, null, 2) : JSON.stringify(data, null, 2);
}

export var ImportModal = {
  name: 'ImportModal',

  data: function() {
    return {
      type: '',
      format: '',
      data: '',
      isDesktop: systemService.isDesktop
    };
  },

  mounted: function() {
    this.type = this.$route.params.type;
    this.format = this.$route.params.format;
  },

  methods: {
    loadFromFile: function() {
      var self = this;
      dialogService
        .openFile(false, ['.b3', '.json'])
        .then(function(path) {
          storageService
            .loadAsync(path)
            .then(function(data) {
              self.data = stringify(data);
            });
        });
    },

    open: function() {
      var importer = editorBridge.getEditor().import;
      var data = parse(this.data);

      try {
        if (this.type === 'project' && this.format === 'json') {
          importer.projectAsData(data);
        } else if (this.type === 'tree' && this.format === 'json') {
          importer.treeAsData(data);
        } else if (this.type === 'nodes' && this.format === 'json') {
          importer.nodesAsData(data);
        }
      } catch (e) {
        notificationState.error('Invalid data', 'The provided data is invalid.');
      }

      this.$router.push('/editor');
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
    '      <h1 class="b3modal-title">Import {{ type }} from {{ format }}</h1>' +
    '      <div class="b3modal-content"><textarea class="b3-input" rows="20" placeholder="Put your data here" v-model="data"></textarea></div>' +
    '    </div>' +
    '    <div class="b3modal-buttons">' +
    '      <button class="b3-button b3-button-neutral b3-button-large b3-float-left" v-if="isDesktop" @click="loadFromFile">Load from file</button>' +
    '      <button class="b3-button b3-button-neutral b3-button-large" @click="close">Cancel</button>' +
    '      <button class="b3-button b3-button-accent b3-button-large" @click="open">Import</button>' +
    '    </div>' +
    '  </div>' +
    '</div>'
};
