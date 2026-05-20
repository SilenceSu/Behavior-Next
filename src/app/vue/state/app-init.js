import { bindDropNode } from '../directives/drop-node.js';
import { dialogService } from '../services/dialog.js';
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

  try {
    var gui = root.require('nw.gui');
    var win = gui.Window.get();
    win.on('close', function() {
      if (editorBridge.isDirty()) {
        dialogService
          .confirm(
            'Leave without saving?',
            'If you proceed you will lose all unsaved modifications.',
            null
          )
          .then(function() {
            win.close(true);
          });
      } else {
        win.close(true);
      }
    });
  } catch (e) {}
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
