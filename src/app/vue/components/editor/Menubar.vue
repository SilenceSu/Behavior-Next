<script lang="ts">
import { dialogService } from '../../services/dialog.ts';
import { editorBridge } from '../../services/editor-bridge.ts';
import { keyboardShortcuts } from '../../services/keyboard-shortcuts.ts';
import { notificationState } from '../../state/notification-state.ts';
import { projectState } from '../../state/project-state.ts';

// 从旧编辑器桥接中取当前项目，菜单命令最终都会落到 editor/project/tree 管理器。
function getProject() {
  return editorBridge.getProject();
}

// 当前选中的行为树；复制、粘贴、缩放等命令都需要树上下文。
function getTree() {
  var project = getProject();
  return project && project.trees.getSelected();
}

// 编辑器顶部菜单和快捷键绑定。这里保留命令式方法，便于和旧画布编辑器 API 对接。
export default {
  name: 'Menubar',

  data: function() {
    return {
      shortcutDisposer: null
    };
  },

  mounted: function() {
    this.bindShortcuts();
  },

  beforeUnmount: function() {
    this.unbindShortcuts();
  },

  methods: {
    bindShortcuts: function() {
      // 重新绑定前先释放旧绑定，避免组件重挂载后同一个快捷键触发多次。
      if (this.shortcutDisposer) {
        this.shortcutDisposer();
      }

      this.shortcutDisposer = keyboardShortcuts.bindAll([
        { key: 'ctrl+q', handler: 'onCloseProject' },
        { key: 'ctrl+s', handler: 'onSaveProject' },
        { key: 'ctrl+z', handler: 'onUndo' },
        { key: 'ctrl+shift+z', handler: 'onRedo' },
        { key: 'ctrl+c', handler: 'onCopy' },
        { key: 'ctrl+v', handler: 'onPaste' },
        { key: 'ctrl+x', handler: 'onCut' },
        { key: 'ctrl+d', handler: 'onDuplicate' },
        { key: 'del', handler: 'onRemove' },
        { key: 'a', handler: 'onAutoOrganize' },
        { key: 'ctrl+a', handler: 'onSelectAll' },
        { key: 'ctrl+shift+a', handler: 'onDeselectAll' },
        { key: 'ctrl+i', handler: 'onInvertSelection' }
      ], this);
    },

    unbindShortcuts: function() {
      // keyboardShortcuts.bindAll 返回统一 disposer，卸载时集中释放。
      if (this.shortcutDisposer) {
        this.shortcutDisposer();
        this.shortcutDisposer = null;
      }
    },

    onExportProjectJson: function() {
      this.$router.push('/editor/export/project/json');
      return false;
    },

    onExportTreeJson: function() {
      this.$router.push('/editor/export/tree/json');
      return false;
    },

    onExportNodesJson: function() {
      this.$router.push('/editor/export/nodes/json');
      return false;
    },

    onImportProjectJson: function() {
      this.$router.push('/editor/import/project/json');
      return false;
    },

    onImportTreeJson: function() {
      this.$router.push('/editor/import/tree/json');
      return false;
    },

    onImportNodesJson: function() {
      this.$router.push('/editor/import/nodes/json');
      return false;
    },

    onCloseProject: function() {
      // 关闭项目会离开编辑器，dirty 状态必须先确认。
      var self = this;
      var doClose = function() {
        projectState.closeProject();
        self.$router.push('/dash/projects');
      };

      if (editorBridge.isDirty()) {
        dialogService
          .confirm('Leave without saving?', 'If you proceed you will lose all unsaved modifications.', null)
          .then(doClose);
      } else {
        doClose();
      }

      return false;
    },

    onSaveProject: function() {
      // 菜单保存直接委托 projectState，成功/失败只负责通知用户。
      projectState
        .saveProject()
        .then(function() {
          notificationState.success('Project saved', 'The project has been saved');
        }, function() {
          notificationState.error('Error', 'Project could not be saved');
        });
      return false;
    },

    onNewTree: function() {
      // 新建树由旧 Project TreeManager 负责，Vue 侧只触发命令。
      var project = getProject();
      if (project) {
        project.trees.add();
      }
      return false;
    },

    onUndo: function() {
      var project = getProject();
      if (project) {
        project.history.undo();
      }
      return false;
    },

    onRedo: function() {
      var project = getProject();
      if (project) {
        project.history.redo();
      }
      return false;
    },

    onCopy: function() {
      var tree = getTree();
      if (tree) tree.edit.copy();
      return false;
    },

    onCut: function() {
      var tree = getTree();
      if (tree) tree.edit.cut();
      return false;
    },

    onPaste: function() {
      var tree = getTree();
      if (tree) tree.edit.paste();
      return false;
    },

    onDuplicate: function() {
      var tree = getTree();
      if (tree) tree.edit.duplicate();
      return false;
    },

    onRemove: function() {
      var tree = getTree();
      if (tree) tree.edit.remove();
      return false;
    },

    onRemoveAllConns: function() {
      var tree = getTree();
      if (tree) tree.edit.removeConnections();
      return false;
    },

    onRemoveInConns: function() {
      var tree = getTree();
      if (tree) tree.edit.removeInConnections();
      return false;
    },

    onRemoveOutConns: function() {
      var tree = getTree();
      if (tree) tree.edit.removeOutConnections();
      return false;
    },

    onAutoOrganize: function() {
      var tree = getTree();
      if (tree) tree.organize.organize();
      return false;
    },

    onZoomIn: function() {
      var tree = getTree();
      if (tree) tree.view.zoomIn();
      return false;
    },

    onZoomOut: function() {
      var tree = getTree();
      if (tree) tree.view.zoomOut();
      return false;
    },

    onSelectAll: function() {
      var tree = getTree();
      if (tree) tree.selection.selectAll();
      return false;
    },

    onDeselectAll: function() {
      var tree = getTree();
      if (tree) tree.selection.deselectAll();
      return false;
    },

    onInvertSelection: function() {
      var tree = getTree();
      if (tree) tree.selection.invertSelection();
      return false;
    }
  }
};
</script>

<template>
<nav class="menubar">
  <div class="menubar-left">
    <div class="side">
      <ul>
        <li><router-link class="logo" title="Home" to="/dash/projects">Behavior Next</router-link></li>
        <li><router-link class="fastlink" title="All projects" to="/dash/projects"><i class="fa fa-fw fa-arrow-circle-o-left"></i></router-link></li>
        <li><router-link class="fastlink" title="Settings" to="/dash/settings"><i class="fa fa-fw fa-cog"></i></router-link></li>
        <li><a class="fastlink" title="Save project" @click="onSaveProject"><i class="fa fa-fw fa-save"></i></a></li>
        <li><a class="fastlink" title="Undo" @click="onUndo"><i class="fa fa-fw fa-undo"></i></a></li>
        <li><a class="fastlink" title="Redo" @click="onRedo"><i class="fa fa-fw fa-repeat"></i></a></li>
      </ul>
    </div>
    <ul>
      <li><a>Project</a><ul>
        <li><router-link to="/dash/projects">All projects<span class="shortcut"></span></router-link></li>
        <li><a @click="onCloseProject">Close project<span class="shortcut">ctrl+q</span></a></li>
        <li><a @click="onSaveProject">Save project<span class="shortcut">ctrl+s</span></a></li>
        <li class="divider"></li>
        <li><a>Export<span class="shortcut arrow-right"></span></a><ul>
          <li><a @click="onExportProjectJson">Project as JSON</a></li>
          <li><a @click="onExportTreeJson">Tree as JSON</a></li>
          <li><a @click="onExportNodesJson">Nodes as JSON</a></li>
        </ul></li>
        <li><a>Import<span class="shortcut arrow-right"></span></a><ul>
          <li><a @click="onImportProjectJson">Project as JSON</a></li>
          <li><a @click="onImportTreeJson">Tree as JSON</a></li>
          <li><a @click="onImportNodesJson">Nodes as JSON</a></li>
        </ul></li>
        <li class="divider"></li>
        <li><router-link to="/dash/settings">Settings<span class="shortcut"></span></router-link></li>
        <li class="divider"></li>
        <li><a @click="onNewTree">New tree<span class="shortcut"></span></a></li>
        <li><router-link to="/editor/node">New node<span class="shortcut"></span></router-link></li>
      </ul></li>
      <li><a>Edit</a><ul>
        <li><a @click="onUndo">Undo<span class="shortcut">ctrl+z</span></a></li>
        <li><a @click="onRedo">Redo<span class="shortcut">ctrl+shift+z</span></a></li>
        <li class="divider"></li>
        <li><a @click="onCopy">Copy<span class="shortcut">ctrl+c</span></a></li>
        <li><a @click="onCut">Cut<span class="shortcut">ctrl+x</span></a></li>
        <li><a @click="onPaste">Paste<span class="shortcut">ctrl+v</span></a></li>
        <li><a @click="onDuplicate">Duplicate<span class="shortcut">ctrl+d</span></a></li>
        <li><a @click="onRemove">Remove<span class="shortcut">delete</span></a></li>
        <li class="divider"></li>
        <li><a @click="onRemoveAllConns">Remove all conns</a></li>
        <li><a @click="onRemoveInConns">Remove all in-conns</a></li>
        <li><a @click="onRemoveOutConns">Remove all out-conns</a></li>
      </ul></li>
      <li><a>View</a><ul>
        <li><a @click="onAutoOrganize">Auto organize<span class="shortcut">a</span></a></li>
        <li class="divider"></li>
        <li><a @click="onZoomIn">Zoom in<span class="shortcut">ctrl+up</span></a></li>
        <li><a @click="onZoomOut">Zoom out<span class="shortcut">ctrl+down</span></a></li>
      </ul></li>
      <li><a>Selection</a><ul>
        <li><a @click="onSelectAll">Select all<span class="shortcut">ctrl+a</span></a></li>
        <li><a @click="onDeselectAll">Deselect all<span class="shortcut">shift+ctrl+a</span></a></li>
        <li><a @click="onInvertSelection">Invert selection<span class="shortcut">ctrl+i</span></a></li>
        <li class="disabled"><a>Select subtree<span class="shortcut">alt+click</span></a></li>
      </ul></li>
    </ul>
  </div>
</nav>
</template>
