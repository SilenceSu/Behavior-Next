var root = window;
var bindings = [];
var nextBindingId = 1;
var isListening = false;

var keyAliases = {
  'arrowup': 'up',
  'arrowdown': 'down',
  'arrowleft': 'left',
  'arrowright': 'right',
  'delete': 'del',
  'del': 'del',
  'escape': 'esc',
  'esc': 'esc',
  ' ': 'space',
  'spacebar': 'space',
  'control': 'ctrl',
  'ctrl': 'ctrl',
  'cmd': 'meta',
  'command': 'meta',
  'mod': 'meta',
  'option': 'alt'
};

function noop() {}

function normalizeKeyName(key) {
  var normalized = String(key || '').trim().toLowerCase();
  return keyAliases[normalized] || normalized;
}

function normalizeShortcut(shortcut) {
  var parts = String(shortcut || '').split('+');
  var modifiers = {
    ctrl: false,
    shift: false,
    alt: false,
    meta: false
  };
  var key = '';

  parts.forEach(function(part) {
    var normalized = normalizeKeyName(part);
    if (!normalized) {
      return;
    }

    if (Object.prototype.hasOwnProperty.call(modifiers, normalized)) {
      modifiers[normalized] = true;
    } else {
      key = normalized;
    }
  });

  if (!key) {
    return '';
  }

  return [
    modifiers.ctrl ? 'ctrl' : '',
    modifiers.shift ? 'shift' : '',
    modifiers.alt ? 'alt' : '',
    modifiers.meta ? 'meta' : '',
    key
  ].filter(Boolean).join('+');
}

function normalizeEvent(event) {
  var key = normalizeKeyName(event.key);
  if (!key) {
    return '';
  }

  if (key === 'ctrl' || key === 'shift' || key === 'alt' || key === 'meta') {
    return '';
  }

  return [
    event.ctrlKey ? 'ctrl' : '',
    event.shiftKey ? 'shift' : '',
    event.altKey ? 'alt' : '',
    event.metaKey ? 'meta' : '',
    key
  ].filter(Boolean).join('+');
}

function isEditableTarget(target) {
  while (target && target !== root.document) {
    if (target.isContentEditable) {
      return true;
    }

    if (target.tagName) {
      var tagName = target.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'select' || tagName === 'textarea') {
        return true;
      }
    }

    target = target.parentNode;
  }

  return false;
}

function ensureListener() {
  if (!isListening && root.document) {
    root.document.addEventListener('keydown', onKeyDown);
    isListening = true;
  }
}

function removeListenerIfIdle() {
  if (isListening && !bindings.length && root.document) {
    root.document.removeEventListener('keydown', onKeyDown);
    isListening = false;
  }
}

function removeBinding(binding) {
  var index = bindings.indexOf(binding);
  if (index !== -1) {
    bindings.splice(index, 1);
  }

  removeListenerIfIdle();
}

function onKeyDown(event) {
  var shortcut = normalizeEvent(event);
  if (!shortcut) {
    return;
  }

  for (var i = bindings.length - 1; i >= 0; i--) {
    var binding = bindings[i];
    if (binding.shortcut !== shortcut) {
      continue;
    }

    if (!binding.options.allowEditableTarget && isEditableTarget(event.target)) {
      continue;
    }

    var result = binding.handler(event);
    if (result !== true) {
      event.preventDefault();
      event.stopPropagation();
    }
    return;
  }
}

function bind(shortcut, handler, options) {
  var normalized = normalizeShortcut(shortcut);
  if (!normalized || typeof handler !== 'function') {
    return noop;
  }

  var binding = {
    id: nextBindingId++,
    shortcut: normalized,
    handler: handler,
    options: options || {}
  };
  var disposed = false;

  bindings.push(binding);
  ensureListener();

  return function disposeShortcut() {
    if (disposed) {
      return;
    }

    disposed = true;
    removeBinding(binding);
  };
}

function bindAll(shortcuts, owner) {
  var disposers = (shortcuts || []).map(function(shortcut) {
    var handler = shortcut.handler;
    if (typeof handler === 'string') {
      handler = function(event) {
        return owner[shortcut.handler](event);
      };
    } else if (owner && typeof handler === 'function') {
      handler = handler.bind(owner);
    }

    return bind(shortcut.key, handler, shortcut.options);
  });
  var disposed = false;

  return function disposeShortcuts() {
    if (disposed) {
      return;
    }

    disposed = true;
    disposers.forEach(function(dispose) {
      dispose();
    });
  };
}

export var keyboardShortcuts = {
  bind: bind,
  bindAll: bindAll
};
