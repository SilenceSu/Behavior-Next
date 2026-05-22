<script lang="ts">
import { dialogService } from '../../services/dialog.ts';
import { editorBridge } from '../../services/editor-bridge.ts';
import { storageService } from '../../services/storage.ts';
import { systemService } from '../../services/system.ts';
import { notificationState } from '../../state/notification-state.ts';

var root = window;

// 保留 JSON3 兼容路径，和导出逻辑使用同一套 JSON 解析策略。
function parse(data) {
  return root.JSON3 ? root.JSON3.parse(data) : JSON.parse(data);
}

// 导入后重新格式化到 textarea，方便用户检查文件内容。
function stringify(data) {
  return root.JSON3 ? root.JSON3.stringify(data, null, 2) : JSON.stringify(data, null, 2);
}

// 导入弹窗：支持粘贴 JSON，也支持 Electron 桌面端从文件读取。
export default {
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
    // type/format 由子路由提供，例如 /editor/import/project/json。
    this.type = this.$route.params.type;
    this.format = this.$route.params.format;
  },

  methods: {
    loadFromFile: function() {
      // Electron 桌面端读取文件后，统一格式化显示在 textarea 中。
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
      // 根据路由参数把 JSON 分派给对应的旧 ImportManager 方法。
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
      // 弹窗由子路由承载，关闭时回到编辑器主路由。
      this.$router.push('/editor');
    }
  }
};
</script>

<template>
<div class="b3modal">
  <div class="b3modal-background" @click="close"></div>
  <div class="b3modal-window">
    <div class="b3modal-wrap">
      <h1 class="b3modal-title">Import {{ type }} from {{ format }}</h1>
      <div class="b3modal-content"><textarea class="b3-input" rows="20" placeholder="Put your data here" v-model="data"></textarea></div>
    </div>
    <div class="b3modal-buttons">
      <button class="b3-button b3-button-neutral b3-button-large b3-float-left" v-if="isDesktop" @click="loadFromFile">Load from file</button>
      <button class="b3-button b3-button-neutral b3-button-large" @click="close">Cancel</button>
      <button class="b3-button b3-button-accent b3-button-large" @click="open">Import</button>
    </div>
  </div>
</div>
</template>
