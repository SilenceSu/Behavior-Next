import { editorBridge } from '../services/editor-bridge.js';

function handleDragOver(event) {
  if (event.preventDefault) {
    event.preventDefault();
  }
  return false;
}

function handleDrop(event) {
  if (event.preventDefault) {
    event.preventDefault();
  }
  if (event.stopPropagation) {
    event.stopPropagation();
  }

  var name = event.dataTransfer.getData('name');
  if (!name) {
    return false;
  }

  var project = editorBridge.getProject();
  var tree = project && project.trees.getSelected();
  if (!tree) {
    return false;
  }

  var point = tree.view.getLocalPoint(event.clientX, event.clientY);
  tree.blocks.add(name, point.x, point.y);
  editorBridge.getEditor()._game.canvas.focus();
  return false;
}

export function bindDropNode(element) {
  if (!element || element.__b3DropNodeBound) {
    return;
  }

  element.addEventListener('dragover', handleDragOver);
  element.addEventListener('drop', handleDrop);
  element.__b3DropNodeBound = true;
}

export var dropNodeDirective = {
  mounted: bindDropNode,
  beforeUnmount: function(element) {
    element.removeEventListener('dragover', handleDragOver);
    element.removeEventListener('drop', handleDrop);
    element.__b3DropNodeBound = false;
  }
};
