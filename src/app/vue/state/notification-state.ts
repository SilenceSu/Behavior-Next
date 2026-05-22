var root = window;
var nextId = 1;

var state = root.Vue.reactive({
  notifications: []
});

function notify(config) {
  var item = Object.assign({
    id: nextId++,
    type: 'default',
    title: '',
    message: '',
    icon: false,
    delay: 3000,
    started: false,
    killed: false
  }, config || {});

  state.notifications.push(item);

  root.setTimeout(function() {
    item.started = true;
  }, 0);

  if (typeof item.delay === 'number') {
    root.setTimeout(function() {
      remove(item);
    }, item.delay);
  }

  return item;
}

function remove(item) {
  item.killed = true;
  root.setTimeout(function() {
    var index = state.notifications.indexOf(item);
    if (index !== -1) {
      state.notifications.splice(index, 1);
    }
  }, 500);
}

export var notificationState = {
  state: state,
  notify: notify,
  remove: remove,
  simple: function(title, message) {
    return notify({ title: title, message: message, type: 'default' });
  },
  success: function(title, message) {
    return notify({ title: title, message: message, icon: 'fa-check', type: 'success' });
  },
  error: function(title, message) {
    return notify({ title: title, message: message, icon: 'fa-close', type: 'error' });
  },
  info: function(title, message) {
    return notify({ title: title, message: message, icon: 'fa-info', type: 'info' });
  },
  warning: function(title, message) {
    return notify({ title: title, message: message, icon: 'fa-warning', type: 'warning' });
  }
};
