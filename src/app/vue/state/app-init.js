import { bindDropNode } from '../directives/drop-node.js';
import { editorBridge } from '../services/editor-bridge.js';
import { projectState } from './project-state.js';
import { settingsState } from './settings-state.js';

var root = window;

function closePreload() {
  root.setTimeout(function() {
    var element = root.document.getElementById('page-preload');
    if (!element) {
      return;
    }

    element.className += ' preload-fade';
    root.setTimeout(function() {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }, 500);
  }, 500);
}

function bindWindowCloseGuard() {
  root.onbeforeunload = function() {
    if (editorBridge.isDirty()) {
      return 'Leaving now will erase your unsaved changes.';
    }
  };
}

export function initializeApp() {
  bindWindowCloseGuard();
  bindDropNode(editorBridge.getEditor()._game.canvas);

  return settingsState
    .getSettings()
    .then(function() {
      return projectState.getRecentProjects();
    })
    .then(function(projects) {
      if (projects.length > 0 && projects[0].isOpen) {
        return projectState.openProject(projects[0].path);
      }
    })
    .catch(function() {})
    .then(closePreload);
}
