<script lang="ts">
import { dialogService } from '../../services/dialog.ts';
import { editorBridge } from '../../services/editor-bridge.ts';
import { notificationState } from '../../state/notification-state.ts';

function getTitle(node) {
  var title = node.title || node.name;
  return title.replace(/(<\w+>)/g, function() {
    return '@';
  });
}

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
      var self = this;
      ['nodechanged', 'noderemoved', 'nodeadded', 'treeadded', 'blockchanged', 'treeselected', 'treeremoved', 'treeimported'].forEach(function(eventName) {
        editorBridge.off(eventName, self.onEditorEvent);
      });
    },

    refresh: function() {
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
      var project = editorBridge.getProject();
      if (project) {
        project.trees.select(id);
      }
    },

    remove: function(id) {
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
<div class="full-height side-panel nodes-panel">

  <!-- Trees 区块 -->
  <div class="panel-section">
    <div class="panel-section-header">
      <span class="panel-section-title">Trees</span>
      <el-button
        type="success"
        size="small"
        text
        class="panel-section-action"
        @click="newTree"
        title="New tree"
      >+</el-button>
    </div>
    <div class="panel-section-body">
      <el-empty v-if="!trees.length" description="No trees" :image-size="40" />
      <ul class="panel-list" v-else>
        <li
          v-for="tree in trees"
          :key="tree.id"
          class="panel-list-item"
          :class="{ 'is-active': tree.active }"
          v-drag-node="tree.id"
          @click="select(tree.id)"
        >
          <span class="panel-list-label">{{ tree.name }}</span>
          <el-button
            type="danger"
            size="small"
            text
            class="panel-list-action"
            @click.stop="remove(tree.id)"
            title="Remove tree"
          >
            <i class="fa fa-times"></i>
          </el-button>
        </li>
      </ul>
    </div>
  </div>

  <!-- Nodes 区块 -->
  <div class="panel-section" v-for="category in categories()" :key="category">
    <div class="panel-section-header">
      <span class="panel-section-title">{{ category }}s</span>
      <router-link v-if="category === 'composite' || category === 'action' || category === 'condition' || category === 'decorator'" to="/editor/node">
        <el-button type="success" size="small" text class="panel-section-action" title="New node">+</el-button>
      </router-link>
    </div>
    <div class="panel-section-body">
      <el-empty v-if="!nodes[category].length" description="empty" :image-size="30" />
      <ul class="panel-list" v-else>
        <li
          v-for="node in nodes[category]"
          :key="node.name"
          class="panel-list-item"
          v-drag-node="node.name"
        >
          <span class="panel-list-label no-select">{{ node.title }}</span>
          <router-link
            v-if="!node.isDefault"
            :to="'/editor/node/' + encodeURIComponent(node.name)"
            @click.stop
          >
            <el-button type="warning" size="small" text class="panel-list-action" title="Edit node">
              <i class="fa fa-pencil"></i>
            </el-button>
          </router-link>
        </li>
      </ul>
    </div>
  </div>

</div>
</template>
