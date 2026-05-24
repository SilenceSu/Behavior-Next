<script lang="ts">
import { dialogService } from '../../services/dialog.ts';
import { editorBridge } from '../../services/editor-bridge.ts';
import { storageService } from '../../services/storage.ts';
import { systemService } from '../../services/system.ts';
import { notificationState } from '../../state/notification-state.ts';

var root = window;

function stringify(data, pretty) {
  if (root.JSON3) {
    return pretty ? root.JSON3.stringify(data, null, 2) : root.JSON3.stringify(data);
  }
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

export default {
  name: 'ExportModal',

  data: function() {
    return {
      type: '',
      format: '',
      compact: '',
      pretty: '',
      result: '',
      hideCompact: false,
      isDesktop: systemService.isDesktop,
      visible: true
    };
  },

  mounted: function() {
    this.createExport();
  },

  watch: {
    '$route.params': function() {
      this.createExport();
      this.visible = true;
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
      this.visible = false;
      this.$router.push('/editor');
    }
  }
};
</script>

<template>
<el-dialog
  v-model="visible"
  :title="'Export ' + type + ' as ' + format"
  width="700px"
  :before-close="close"
  destroy-on-close
>
  <pre id="export-result" style="max-height: 400px; overflow: auto; font-size: 12px; background: var(--el-fill-color-darker); padding: 12px; border-radius: 4px;">{{ result || 'Loading...' }}</pre>

  <template #footer>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <el-button @click="select">Select result</el-button>
        <el-button v-if="!hideCompact && result !== compact" @click="result = compact">Compact</el-button>
        <el-button v-if="!hideCompact && result !== pretty" @click="result = pretty">Pretty</el-button>
        <el-button v-if="isDesktop" @click="save">Save</el-button>
      </div>
      <el-button type="primary" @click="close">OK</el-button>
    </div>
  </template>
</el-dialog>
</template>
