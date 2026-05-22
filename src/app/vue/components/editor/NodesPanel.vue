<script lang="ts">
import { dialogService } from '../../services/dialog.ts';
import { editorBridge } from '../../services/editor-bridge.ts';
import { notificationState } from '../../state/notification-state.ts';

// 节点标题中的 <参数> 在侧栏中用 @ 占位，保持旧编辑器展示习惯。
function getTitle(node) {
  var title = node.title || node.name;
  return title.replace(/(<\w+>)/g, function() {
    return '@';
  });
}

// 左侧面板：展示项目树列表和可拖拽的节点类型列表。
export default {
  name: 'NodesPanel',

  data: function() {
    return {
      trees: [],
      nodes: {
        composite: [],
        decorator: [],
        action: [],
        condition: []
      }
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
      // 旧编辑器通过事件通知 Vue 侧刷新，延迟到下一轮避免读到更新前状态。
      var self = this;
      this.onEditorEvent = function() {
        setTimeout(function() {
          self.refresh();
        }, 0);
      };

      ['nodechanged', 'noderemoved', 'nodeadded', 'treeadded', 'blockchanged', 'treeselected', 'treeremoved', 'treeimported'].forEach(function(eventName) {
        editorBridge.on(eventName, self.onEditorEvent);
      });
    },

    destroySubscriptions: function() {
      // 面板卸载时解绑所有 editorBridge 事件，避免重复刷新和内存泄漏。
      var self = this;
      ['nodechanged', 'noderemoved', 'nodeadded', 'treeadded', 'blockchanged', 'treeselected', 'treeremoved', 'treeimported'].forEach(function(eventName) {
        editorBridge.off(eventName, self.onEditorEvent);
      });
    },

    refresh: function() {
      // 从旧 Project/NodeManager 重新构造 Vue 可渲染的树和节点列表。
      var project = editorBridge.getProject();
      if (!project) {
        return;
      }

      var nodes = {
        composite: [],
        decorator: [],
        action: [],
        condition: []
      };
      var trees = [];

      project.nodes.each(function(node) {
        if (node.category === 'tree') {
          return;
        }

        var list = nodes[node.category];
        if (!list) {
          return;
        }

        list.push({
          name: node.name,
          title: getTitle(node),
          isDefault: node.isDefault
        });
      });

      var selected = project.trees.getSelected();
      project.trees.each(function(tree) {
        var root = tree.blocks.getRoot();
        trees.push({
          id: tree._id,
          name: root.title || 'A behavior tree',
          active: tree === selected
        });
      });

      this.nodes = nodes;
      this.trees = trees;
    },

    newTree: function() {
      var project = editorBridge.getProject();
      if (project) {
        project.trees.add();
      }
    },

    select: function(id) {
      // 选择树后旧编辑器会触发 treeselected，面板随后通过订阅刷新 active 状态。
      var project = editorBridge.getProject();
      if (project) {
        project.trees.select(id);
      }
    },

    remove: function(id) {
      // 删除树会连带移除引用该树的块，因此必须提示用户确认。
      dialogService
        .confirm('Remove tree?', 'Are you sure you want to remove this tree?\n\nNote: all blocks using this tree will be removed.')
        .then(function() {
          var project = editorBridge.getProject();
          project.trees.remove(id);
          notificationState.success('Tree removed', 'The tree has been removed from this project.');
        });
    },

    categories: function() {
      return Object.keys(this.nodes);
    }
  }
};
</script>

<template>
<div class="full-height side-panel">
  <div class="node-list">
    <div class="title">
      <a class="new b3-button b3-button-plain b3-button-xsmall" style="display:none" @click="newTree">New</a>
      <a>Trees</a>
    </div>
    <div class="node-list-content">
      <div class="node-list-category"><ul>
        <li v-for="tree in trees" :key="tree.id">
          <a class="remove b3-button b3-button-plain b3-button-xsmall" style="display:none" @click="remove(tree.id)">Remove</a>
          <a :data-name="tree.id" :class="{active:tree.active}" @click="select(tree.id)" v-drag-node="tree.id">{{ tree.name }}</a>
        </li>
      </ul></div>
    </div>
    <div class="title">
      <router-link class="new b3-button b3-button-plain b3-button-xsmall" style="display:none" to="/editor/node">New</router-link>
      <a>Nodes</a>
    </div>
    <div class="node-list-content">
      <div v-for="category in categories()" :key="category" class="node-list-category">
        <div class="node-list-title">{{ category }}s</div>
        <ul>
          <li v-for="node in nodes[category]" :key="node.name">
            <router-link v-if="!node.isDefault" class="edit b3-button b3-button-plain b3-button-xsmall" style="display:none" :to="'/editor/node/' + encodeURIComponent(node.name)">Edit</router-link>
            <a class="no-select" :data-name="node.name" v-drag-node="node.name">{{ node.title }}</a>
          </li>
        </ul>
        <ul class="empty" v-if="!nodes[category].length"><li>empty</li></ul>
      </div>
    </div>
  </div>
</div>
</template>
