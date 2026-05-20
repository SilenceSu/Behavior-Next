import { KeyTable } from '../KeyTable.js';
import { editorBridge } from '../../services/editor-bridge.js';

var root = window;

function cloneProperties(properties) {
  if (root.tine && root.tine.merge) {
    return root.tine.merge({}, properties);
  }
  return Object.assign({}, properties);
}

export var PropertiesPanel = {
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
  },

  template: '' +
    '<div class="full-height side-panel">' +
    '  <div class="title">Properties</div>' +
    '  <div v-if="!block" class="properties">' +
    '    <p class="b3-align-center">Select a <strong>single</strong> block to change its properties.</p>' +
    '    <p class="b3-align-center"><em>NOTE: The root node represents a tree. Therefore, changes applied to this node will persist on the tree object.</em></p>' +
    '  </div>' +
    '  <div v-else class="properties">' +
    '    <form>' +
    '      <div class="b3-field">' +
    '        <label for="title">Title</label>' +
    '        <input type="text" class="b3-input" name="title" placeholder="Title" @keydown="keydown" v-model="block.title" @input="update">' +
    '      </div>' +
    '      <div class="b3-field">' +
    '        <label for="description">Description</label>' +
    '        <textarea name="description" rows="4" class="b3-input" placeholder="Description" @keydown="keydown" v-model="block.description" @input="update"></textarea>' +
    '      </div>' +
    '      <div class="b3-field">' +
    '        <KeyTable heading="Properties" :model-value="block.properties" @update:model-value="updateProperties" class="no-border"></KeyTable>' +
    '      </div>' +
    '    </form>' +
    '  </div>' +
    '</div>'
};
