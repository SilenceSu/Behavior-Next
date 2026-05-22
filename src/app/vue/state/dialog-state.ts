var root = window;
var nextId = 1;

var state = root.Vue.reactive({
  current: null,
  queue: []
});

function pump() {
  if (!state.current && state.queue.length) {
    state.current = state.queue.shift();
  }
}

function enqueue(kind, config) {
  config = config || {};

  return new Promise(function(resolve, reject) {
    state.queue.push(Object.assign({
      id: nextId++,
      kind: kind,
      title: '',
      text: '',
      type: 'default',
      placeholder: '',
      defaultValue: '',
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      showCancelButton: kind !== 'alert',
      resolve: resolve,
      reject: reject
    }, config));

    pump();
  });
}

function settle(request, confirmed, value) {
  if (!request || !state.current || request.id !== state.current.id) {
    return;
  }

  state.current = null;

  if (confirmed) {
    request.resolve(value);
  } else {
    request.reject(value);
  }

  root.setTimeout(pump, 0);
}

function clear() {
  var pending = [];
  if (state.current) {
    pending.push(state.current);
  }

  pending = pending.concat(state.queue.splice(0, state.queue.length));
  state.current = null;

  pending.forEach(function(request) {
    request.reject();
  });
}

export var dialogState = {
  state: state,

  alert: function(config) {
    return enqueue('alert', config);
  },

  confirm: function(config) {
    return enqueue('confirm', config);
  },

  prompt: function(config) {
    return enqueue('prompt', config);
  },

  confirmRequest: function(request, value) {
    settle(request, true, value);
  },

  cancelRequest: function(request) {
    settle(request, false);
  },

  clear: clear
};
