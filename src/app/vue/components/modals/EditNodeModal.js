import { KeyTable } from '../KeyTable.js';
import { dialogService } from '../../services/dialog.js';
import { editorBridge } from '../../services/editor-bridge.js';
import { notificationState } from '../../state/notification-state.js';

var root = window;

export var EditNodeModal = {
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

      var blacklist = [];
      project.nodes.each(function(node) {
        if (node.name !== this.node.name) {
          blacklist.push(node.name);
        }
      }, this);
      this.blacklist = blacklist;
    },

    updateProperties: function(properties) {
      this.node.properties = properties;
    },

    save: function() {
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
      this.$router.push('/editor');
    }
  },

  template: '' +
    '<div class="b3modal">' +
    '  <div class="b3modal-background" @click="close"></div>' +
    '  <div class="b3modal-window">' +
    '    <form v-if="node" class="full-height" @submit.prevent="save">' +
    '      <div class="b3modal-wrap">' +
    '        <h1 class="b3modal-title">{{ action }} node</h1>' +
    '        <div class="b3modal-content">' +
    '          <div class="row">' +
    '            <div class="form-group col-md-4" :class="{\'has-error\': invalidName}">' +
    '              <label for="name" class="control-label">Name</label>' +
    '              <input type="text" class="form-control" name="name" v-model="node.name" required autofocus>' +
    '              <p class="help-block" v-if="blacklist.indexOf(node.name) !== -1">Node already exists</p>' +
    '            </div>' +
    '            <div class="form-group col-md-4">' +
    '              <label for="title" class="control-label">Title</label>' +
    '              <input type="text" class="form-control" name="title" v-model="node.title">' +
    '            </div>' +
    '            <div class="form-group col-md-4">' +
    '              <label for="category" class="control-label">Category</label>' +
    '              <select class="form-control" v-model="node.category" :disabled="!!original">' +
    '                <option value="composite">Composite</option>' +
    '                <option value="decorator">Decorator</option>' +
    '                <option value="action">Action</option>' +
    '                <option value="condition">Condition</option>' +
    '              </select>' +
    '            </div>' +
    '          </div>' +
    '          <div class="row">' +
    '            <div class="form-group col-md-6">' +
    '              <label for="description" class="control-label">Description</label>' +
    '              <textarea name="description" class="form-control" rows="14" v-model="node.description"></textarea>' +
    '            </div>' +
    '            <div class="form-group col-md-6">' +
    '              <KeyTable heading="Properties" :model-value="node.properties" @update:model-value="updateProperties"></KeyTable>' +
    '            </div>' +
    '          </div>' +
    '        </div>' +
    '      </div>' +
    '      <div class="b3modal-buttons">' +
    '        <input type="button" class="btn btn-danger btn-lg pull-left" @click="remove" value="Remove" v-if="original">' +
    '        <input type="button" class="btn btn-default btn-lg" @click="close" value="Cancel">' +
    '        <button type="submit" class="btn btn-success btn-lg" :disabled="invalidName">Save</button>' +
    '      </div>' +
    '    </form>' +
    '  </div>' +
    '</div>'
};
