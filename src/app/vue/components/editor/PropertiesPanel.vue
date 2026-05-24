<script lang="ts">
import KeyTable from '../KeyTable.vue';
import { editorBridge } from '../../services/editor-bridge.ts';

function cloneProperties(properties) {
  return window.b3e.runtime.merge({}, properties);
}

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
      var self = this;
      ['blockselected', 'blockdeselected', 'blockremoved', 'treeselected', 'nodechanged'].forEach(function(eventName) {
        editorBridge.off(eventName, self.onEditorEvent);
      });
    },

    refresh: function() {
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
      if (event.ctrlKey && event.keyCode === 90) {
        event.preventDefault();
      }
      return false;
    },

    update: function() {
      if (!this.original || !this.block) {
        return;
      }

      var tree = editorBridge.getSelectedTree();
      if (tree) {
        tree.blocks.update(this.original, this.block);
      }
    },

    updateProperties: function(properties) {
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
<div class="full-height side-panel properties-panel">

  <div class="panel-section-header">
    <span class="panel-section-title">Properties</span>
  </div>

  <!-- 未选中状态 -->
  <div v-if="!block" class="properties-empty">
    <el-empty :image-size="48" description=" ">
      <template #description>
        <p style="font-size: 12px; opacity: 0.5; text-align: center; margin: 0; line-height: 1.6;">
          Select a <strong>single</strong> block<br>to edit its properties.
        </p>
      </template>
    </el-empty>
  </div>

  <!-- 已选中状态 -->
  <div v-else class="properties-form">
    <el-form label-position="top" size="small">

      <el-form-item label="Title">
        <el-input
          v-model="block.title"
          placeholder="Title"
          @keydown="keydown"
          @input="update"
          clearable
        />
      </el-form-item>

      <el-form-item label="Description">
        <el-input
          v-model="block.description"
          type="textarea"
          :rows="4"
          placeholder="Description"
          @keydown="keydown"
          @input="update"
          resize="none"
        />
      </el-form-item>

      <el-form-item>
        <KeyTable
          heading="Properties"
          :model-value="block.properties"
          @update:model-value="updateProperties"
        />
      </el-form-item>

    </el-form>
  </div>

</div>
</template>
