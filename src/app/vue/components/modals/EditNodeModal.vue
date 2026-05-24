<script lang="ts">
import KeyTable from '../KeyTable.vue';
import { dialogService } from '../../services/dialog.ts';
import { editorBridge } from '../../services/editor-bridge.ts';
import { notificationState } from '../../state/notification-state.ts';

var root = window;

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
      blacklist: [],
      visible: true
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
      this.visible = true;
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

      this.close();
    },

    remove: function() {
      var self = this;
      dialogService
        .confirm('Remove node?', 'Are you sure you want to remove this node?\n\nNote: all blocks using this node will be removed.')
        .then(function() {
          var project = editorBridge.getProject();
          project.nodes.remove(self.original);
          notificationState.success('Node removed', 'The node has been removed from this project.');
          self.close();
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
  :title="action + ' node'"
  width="760px"
  :before-close="close"
  destroy-on-close
>
  <el-form v-if="node" label-position="top">
    <el-row :gutter="16">
      <el-col :span="8">
        <el-form-item
          label="Name"
          :error="blacklist.indexOf(node.name) !== -1 ? 'Node already exists' : ''"
        >
          <el-input v-model="node.name" placeholder="Name" autofocus />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="Title">
          <el-input v-model="node.title" placeholder="Title" />
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="Category">
          <el-select v-model="node.category" :disabled="!!original" style="width: 100%">
            <el-option value="composite" label="Composite" />
            <el-option value="decorator" label="Decorator" />
            <el-option value="action" label="Action" />
            <el-option value="condition" label="Condition" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="16">
      <el-col :span="12">
        <el-form-item label="Description">
          <el-input
            v-model="node.description"
            type="textarea"
            :rows="10"
            placeholder="Description"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <KeyTable
          heading="Properties"
          :model-value="node.properties"
          @update:model-value="updateProperties"
        />
      </el-col>
    </el-row>
  </el-form>

  <template #footer>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <el-button v-if="original" type="danger" @click="remove">Remove</el-button>
      <div v-else></div>
      <div>
        <el-button @click="close">Cancel</el-button>
        <el-button type="success" :disabled="invalidName" @click="save">Save</el-button>
      </div>
    </div>
  </template>
</el-dialog>
</template>
