<script lang="ts">
import KeyTable from '../KeyTable.vue';
import { editorBridge } from '../../services/editor-bridge.ts';

// 深拷贝属性对象，避免表单编辑时直接修改旧画布块实例。
function cloneProperties(properties) {
  return window.b3e.runtime.merge({}, properties);
}

// 右侧属性面板：只编辑当前单选块的标题、描述和自定义属性。
export default {
  name: 'PropertiesPanel',
  components: {
    KeyTable: KeyTable
  },

  data: function() {
    return {
      original: null,
      block: null
    };
  },

  mounted: function() {
    this.createSubscriptions();
    this.refresh();
  },

  beforeUnmount: function() {
    this.destroySubscriptions();
  },

  methods: {
    createSubscriptions: function() {
      // 画布选择和节点定义变化都会影响属性面板内容，需要重新读取当前选择。
      var self = this;
      this.onEditorEvent = function() {
        setTimeout(function() {
          self.refresh();
        }, 0);
      };

      ['blockselected', 'blockdeselected', 'blockremoved', 'treeselected', 'nodechanged'].forEach(function(eventName) {
        editorBridge.on(eventName, self.onEditorEvent);
      });
    },

    destroySubscriptions: function() {
      // 卸载时解绑旧编辑器事件，避免重复订阅。
      var self = this;
      ['blockselected', 'blockdeselected', 'blockremoved', 'treeselected', 'nodechanged'].forEach(function(eventName) {
        editorBridge.off(eventName, self.onEditorEvent);
      });
    },

    refresh: function() {
      // 只有单选块时显示表单；多选或未选中时显示提示文案。
      var project = editorBridge.getProject();
      var tree = project && project.trees.getSelected();
      var selection = tree && tree.blocks.getSelected();

      if (selection && selection.length === 1) {
        this.original = selection[0];
        this.block = {
          title: this.original.title,
          description: this.original.description,
          properties: cloneProperties(this.original.properties)
        };
      } else {
        this.original = null;
        this.block = null;
      }
    },

    keydown: function(event) {
      // 阻止输入框里的 ctrl+z 冒泡到编辑器历史系统。
      if (event.ctrlKey && event.keyCode === 90) {
        event.preventDefault();
      }
      return false;
    },

    update: function() {
      // 表单变更实时写回旧 BlockManager，以保持画布节点同步刷新。
      if (!this.original || !this.block) {
        return;
      }

      var tree = editorBridge.getSelectedTree();
      if (tree) {
        tree.blocks.update(this.original, this.block);
      }
    },

    updateProperties: function(properties) {
      // KeyTable 通过 v-model 风格事件回传完整属性对象。
      if (!this.block) {
        return;
      }

      this.block.properties = properties;
      this.update();
    }
  }
};
</script>

<template>
<div class="full-height side-panel">
  <div class="title">Properties</div>
  <div v-if="!block" class="properties">
    <p class="b3-align-center">Select a <strong>single</strong> block to change its properties.</p>
    <p class="b3-align-center"><em>NOTE: The root node represents a tree. Therefore, changes applied to this node will persist on the tree object.</em></p>
  </div>
  <div v-else class="properties">
    <form>
      <div class="b3-field">
        <label for="title">Title</label>
        <input type="text" class="b3-input" name="title" placeholder="Title" @keydown="keydown" v-model="block.title" @input="update">
      </div>
      <div class="b3-field">
        <label for="description">Description</label>
        <textarea name="description" rows="4" class="b3-input" placeholder="Description" @keydown="keydown" v-model="block.description" @input="update"></textarea>
      </div>
      <div class="b3-field">
        <KeyTable heading="Properties" :model-value="block.properties" @update:model-value="updateProperties" class="no-border"></KeyTable>
      </div>
    </form>
  </div>
</div>
</template>
