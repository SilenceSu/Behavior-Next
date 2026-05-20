import { editorBridge } from '../services/editor-bridge.js';

function getName(binding, element) {
  return binding.value || element.getAttribute('data-name');
}

export var dragNodeDirective = {
  mounted: function(element, binding) {
    element.setAttribute('draggable', 'true');
    element.__b3DragNodeHandler = function(event) {
      var name = getName(binding, element);
      var canvas = editorBridge.getEditor().preview(name);
      var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

      if (!canvas) {
        return;
      }

      if (isChrome) {
        var image = document.createElement('img');
        image.src = canvas.toDataURL();

        var time = new Date().getTime();
        var delay = time + 10;
        while (time < delay) {
          time = new Date().getTime();
        }
        canvas = image;
      }

      event.dataTransfer.setData('name', name);
      event.dataTransfer.setDragImage(canvas, canvas.width / 2, canvas.height / 2);
    };

    element.addEventListener('dragstart', element.__b3DragNodeHandler);
  },

  updated: function(element, binding) {
    element.setAttribute('data-name', getName(binding, element));
  },

  beforeUnmount: function(element) {
    element.removeEventListener('dragstart', element.__b3DragNodeHandler);
    element.__b3DragNodeHandler = null;
  }
};
