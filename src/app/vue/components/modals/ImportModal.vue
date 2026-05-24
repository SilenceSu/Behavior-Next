<script lang="ts">
import { dialogService } from '../../services/dialog.ts';
import { editorBridge } from '../../services/editor-bridge.ts';
import { storageService } from '../../services/storage.ts';
import { systemService } from '../../services/system.ts';
import { notificationState } from '../../state/notification-state.ts';

var root = window;

function parse(data) {
  return root.JSON3 ? root.JSON3.parse(data) : JSON.parse(data);
}

function stringify(data) {
  return root.JSON3 ? root.JSON3.stringify(data, null, 2) : JSON.stringify(data, null, 2);
}

export default {
  name: 'ImportModal',

  data: function() {
    return {
      type: '',
      format: '',
      data: '',
      isDesktop: systemService.isDesktop,
      visible: true
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

      this.close();
    },

    close: function() {
      this.visible = false;
      this.$router.push('/editor');
    }
  }
};
</script>

<template>
<el-dialog
  v-model="visible"
  :title="'Import ' + type + ' from ' + format"
  width="600px"
  :before-close="close"
  destroy-on-close
>
  <el-input
    v-model="data"
    type="textarea"
    :rows="16"
    placeholder="Put your data here"
  />

  <template #footer>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <el-button v-if="isDesktop" @click="loadFromFile">Load from file</el-button>
      <div v-else></div>
      <div>
        <el-button @click="close">Cancel</el-button>
        <el-button type="primary" @click="open">Import</el-button>
      </div>
    </div>
  </template>
</el-dialog>
</template>
