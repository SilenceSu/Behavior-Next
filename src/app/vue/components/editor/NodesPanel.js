import { dialogService } from '../../services/dialog.js';
import { editorBridge } from '../../services/editor-bridge.js';
import { notificationState } from '../../state/notification-state.js';

function getTitle(node) {
  var title = node.title || node.name;
  return title.replace(/(<\w+>)/g, function() {
    return '@';
  });
}

export var NodesPanel = {
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
  },

  template: '' +
    '<div class="full-height side-panel">' +
    '  <div class="node-list">' +
    '    <div class="title">' +
    '      <a class="new btn btn-link btn-xs" style="display:none" @click="newTree">New</a>' +
    '      <a>Trees</a>' +
    '    </div>' +
    '    <div class="node-list-content">' +
    '      <div class="node-list-category"><ul>' +
    '        <li v-for="tree in trees" :key="tree.id">' +
    '          <a class="remove btn btn-link btn-xs" style="display:none" @click="remove(tree.id)">Remove</a>' +
    '          <a :data-name="tree.id" :class="{active:tree.active}" @click="select(tree.id)" v-drag-node="tree.id">{{ tree.name }}</a>' +
    '        </li>' +
    '      </ul></div>' +
    '    </div>' +
    '    <div class="title">' +
    '      <router-link class="new btn btn-link btn-xs" style="display:none" to="/editor/node">New</router-link>' +
    '      <a>Nodes</a>' +
    '    </div>' +
    '    <div class="node-list-content">' +
    '      <div v-for="category in categories()" :key="category" class="node-list-category">' +
    '        <div class="node-list-title">{{ category }}s</div>' +
    '        <ul>' +
    '          <li v-for="node in nodes[category]" :key="node.name">' +
    '            <router-link v-if="!node.isDefault" class="edit btn btn-link btn-xs" style="display:none" :to="\'/editor/node/\' + encodeURIComponent(node.name)">Edit</router-link>' +
    '            <a class="no-select" :data-name="node.name" v-drag-node="node.name">{{ node.title }}</a>' +
    '          </li>' +
    '        </ul>' +
    '        <ul class="empty" v-if="!nodes[category].length"><li>empty</li></ul>' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    '</div>'
};
