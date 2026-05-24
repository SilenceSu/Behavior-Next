var root = window;

// 用 ElNotification 替换自定义通知实现，对外接口保持不变。
// 所有调用方无需修改。

var state = root.Vue.reactive({
  notifications: []
});

function getElNotification() {
  return root.ElementPlus && root.ElementPlus.ElNotification;
}

var typeIconMap = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
  default: 'info'
};

function notify(config) {
  var ElNotification = getElNotification();

  if (ElNotification) {
    ElNotification({
      title: config.title || '',
      message: config.message || '',
      type: typeIconMap[config.type] || 'info',
      duration: typeof config.delay === 'number' ? config.delay : 3000,
      position: 'bottom-right'
    });
  }

  // 保留 state.notifications 以防有组件直接读取（向后兼容）
  var item = Object.assign({
    id: Date.now(),
    type: 'default',
    title: '',
    message: '',
    icon: false,
    delay: 3000,
    started: true,
    killed: false
  }, config || {});

  return item;
}

function remove() {}

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
