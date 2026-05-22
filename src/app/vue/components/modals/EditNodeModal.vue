<script lang="ts">
import KeyTable from '../KeyTable.vue';
import { dialogService } from '../../services/dialog.ts';
import { editorBridge } from '../../services/editor-bridge.ts';
import { notificationState } from '../../state/notification-state.ts';

var root = window;

// 自定义节点编辑弹窗：创建或更新项目级节点类型定义。
export default {
  name: 'EditNodeModal',
  components: {
    KeyTable: KeyTable
  },

  data: function() {
    return {
      action: 'New',
      node: null,
      original: null,
      blacklist: []
    };
  },

  computed: {
    invalidName: function() {
      // 名称为空或与其他节点冲突时禁止保存。
      return !this.node || !this.node.name || this.blacklist.indexOf(this.node.name) !== -1;
    }
  },

  mounted: function() {
    this.loadNode();
  },

  watch: {
    '$route.params.name': function() {
      this.loadNode();
    }
  },

  methods: {
    loadNode: function() {
      // 有路由参数时编辑已有节点；没有参数时创建新的自定义节点。
      var project = editorBridge.getProject();
      var name = this.$route.params.name;

      if (name) {
        var node = project.nodes.get(name);
        this.node = node.copy();
        this.original = node;
        this.action = 'Update';
      } else {
        this.node = new root.b3e.Node();
        this.node.category = 'composite';
        this.original = null;
        this.action = 'New';
      }

      // 黑名单排除当前节点自身，用于判断重命名是否冲突。
      var blacklist = [];
      project.nodes.each(function(node) {
        if (node.name !== this.node.name) {
          blacklist.push(node.name);
        }
      }, this);
      this.blacklist = blacklist;
    },

    updateProperties: function(properties) {
      // KeyTable 返回完整属性对象，直接替换节点属性。
      this.node.properties = properties;
    },

    save: function() {
      // 更新或新增都通过旧 NodeManager，确保历史记录和画布刷新逻辑一致。
      if (this.invalidName) {
        return;
      }

      var project = editorBridge.getProject();
      if (this.original) {
        project.nodes.update(this.original, this.node);
        notificationState.success('Node updated', 'Node has been updated successfully.');
      } else {
        project.nodes.add(this.node);
        notificationState.success('Node created', 'Node has been created successfully.');
      }

      this.$router.push('/editor');
    },

    remove: function() {
      // 删除节点类型会移除所有使用该类型的块，必须确认。
      var self = this;
      dialogService
        .confirm('Remove node?', 'Are you sure you want to remove this node?\n\nNote: all blocks using this node will be removed.')
        .then(function() {
          var project = editorBridge.getProject();
          project.nodes.remove(self.original);
          notificationState.success('Node removed', 'The node has been removed from this project.');
          self.$router.push('/editor');
        });
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
    <form v-if="node" class="full-height" @submit.prevent="save">
      <div class="b3modal-wrap">
        <h1 class="b3modal-title">{{ action }} node</h1>
        <div class="b3modal-content">
          <div class="b3-layout">
            <div class="b3-field b3-span-4" :class="{'b3-field-error': invalidName}">
              <label for="name" class="b3-field-label">Name</label>
              <input type="text" class="b3-input" name="name" v-model="node.name" required autofocus>
              <p class="b3-help" v-if="blacklist.indexOf(node.name) !== -1">Node already exists</p>
            </div>
            <div class="b3-field b3-span-4">
              <label for="title" class="b3-field-label">Title</label>
              <input type="text" class="b3-input" name="title" v-model="node.title">
            </div>
            <div class="b3-field b3-span-4">
              <label for="category" class="b3-field-label">Category</label>
              <select class="b3-input" v-model="node.category" :disabled="!!original">
                <option value="composite">Composite</option>
                <option value="decorator">Decorator</option>
                <option value="action">Action</option>
                <option value="condition">Condition</option>
              </select>
            </div>
          </div>
          <div class="b3-layout">
            <div class="b3-field b3-span-6">
              <label for="description" class="b3-field-label">Description</label>
              <textarea name="description" class="b3-input" rows="14" v-model="node.description"></textarea>
            </div>
            <div class="b3-field b3-span-6">
              <KeyTable heading="Properties" :model-value="node.properties" @update:model-value="updateProperties"></KeyTable>
            </div>
          </div>
        </div>
      </div>
      <div class="b3modal-buttons">
        <input type="button" class="b3-button b3-button-danger b3-button-large b3-float-left" @click="remove" value="Remove" v-if="original">
        <input type="button" class="b3-button b3-button-neutral b3-button-large" @click="close" value="Cancel">
        <button type="submit" class="b3-button b3-button-confirm b3-button-large" :disabled="invalidName">Save</button>
      </div>
    </form>
  </div>
</div>
</template>
