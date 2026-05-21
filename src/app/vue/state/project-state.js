import { systemService } from '../services/system.js';
import { storageService } from '../services/storage.js';
import { editorBridge } from '../services/editor-bridge.js';

var root = window;
var state = root.Vue.reactive({
  recentProjects: [],
  currentProject: null,
  loaded: false
});

var recentPath = systemService.join(systemService.getDataPath(), 'recents.json');

function saveRecentProjects() {
  return storageService.saveAsync(recentPath, state.recentProjects);
}

function updateRecentProjects(project) {
  if (project) {
    for (var i = state.recentProjects.length - 1; i >= 0; i--) {
      if (state.recentProjects[i].path === project.path) {
        state.recentProjects.splice(i, 1);
      } else {
        state.recentProjects[i].isOpen = false;
      }
    }

    state.recentProjects.splice(0, 0, {
      name: project.name,
      description: project.description,
      path: project.path,
      isOpen: true
    });
  } else {
    for (var j = 0; j < state.recentProjects.length; j++) {
      state.recentProjects[j].isOpen = false;
    }
  }

  return saveRecentProjects();
}

function setProject(project) {
  state.currentProject = project;
  return updateRecentProjects(project);
}

export var projectState = {
  state: state,

  getRecentProjects: function() {
    if (state.loaded) {
      return Promise.resolve(state.recentProjects);
    }

    return storageService
      .loadAsync(recentPath)
      .catch(function() {
        return [];
      })
      .then(function(data) {
        state.recentProjects.splice.apply(state.recentProjects, [0, state.recentProjects.length].concat(data || []));
        state.loaded = true;
        return state.recentProjects;
      });
  },

  newProject: function(path, name) {
    var project = {
      name: name,
      description: '',
      data: [],
      path: path
    };

    editorBridge.newProject();
    project.data = editorBridge.exportProject();

    return this.saveProject(project).then(function() {
      return setProject(project);
    });
  },

  getProject: function() {
    return state.currentProject;
  },

  saveProject: function(project) {
    project = project || state.currentProject;
    project.data = editorBridge.exportProject();
    editorBridge.clearDirty();
    return storageService.saveAsync(project.path, project).then(function() {
      return updateRecentProjects(project);
    });
  },

  openProject: function(path) {
    return storageService
      .loadAsync(path)
      .then(function(project) {
        editorBridge.openProject(project.data);
        return setProject(project).then(function() {
          return project;
        });
      });
  },

  closeProject: function() {
    editorBridge.clearDirty();
    editorBridge.closeProject();
    return setProject(null);
  },

  removeProject: function(path) {
    for (var i = 0; i < state.recentProjects.length; i++) {
      if (state.recentProjects[i].path === path) {
        state.recentProjects.splice(i, 1);
        break;
      }
    }

    return saveRecentProjects();
  }
};
