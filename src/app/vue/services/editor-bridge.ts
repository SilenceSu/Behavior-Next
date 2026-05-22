var root = window;

function getEditor() {
  return root.editor;
}

function getProject() {
  var editor = getEditor();
  return editor && editor.project.get();
}

function getSelectedTree() {
  var project = getProject();
  return project && project.trees.getSelected();
}

export var editorBridge = {
  getEditor: getEditor,
  getProject: getProject,
  getSelectedTree: getSelectedTree,

  getDefaultSettings: function() {
    return root.b3e.DEFAULT_SETTINGS;
  },

  applySettings: function(settings) {
    getEditor().applySettings(settings);
  },

  newProject: function() {
    getEditor().project.create();
  },

  openProject: function(data) {
    getEditor().project.open(data);
  },

  closeProject: function() {
    getEditor().project.close();
  },

  exportProject: function() {
    return getEditor().export.projectToData();
  },

  isDirty: function() {
    var editor = getEditor();
    return !!editor && editor.isDirty();
  },

  clearDirty: function() {
    getEditor().clearDirty();
  },

  on: function(name, handler) {
    getEditor().on(name, handler);
  },

  off: function(name, handler) {
    getEditor().off(name, handler);
  }
};
