var root = window;

// 用 ElMessageBox 替换自定义弹窗实现，对外接口保持不变。
// 所有调用方（dialogService、各 view）无需修改。

function getElMessageBox() {
  return root.ElementPlus && root.ElementPlus.ElMessageBox;
}

function enqueueAlert(config) {
  var ElMessageBox = getElMessageBox();
  if (!ElMessageBox) {
    return Promise.resolve();
  }

  return ElMessageBox.alert(config.text || '', config.title || '', {
    confirmButtonText: config.confirmButtonText || 'OK',
    type: config.type === 'error' ? 'error' : config.type === 'warning' ? 'warning' : 'info',
    dangerouslyUseHTMLString: false
  }).catch(function() {});
}

function enqueueConfirm(config) {
  var ElMessageBox = getElMessageBox();
  if (!ElMessageBox) {
    return Promise.reject();
  }

  return ElMessageBox.confirm(config.text || '', config.title || '', {
    confirmButtonText: config.confirmButtonText || 'OK',
    cancelButtonText: config.cancelButtonText || 'Cancel',
    type: config.type === 'error' ? 'error' : config.type === 'warning' ? 'warning' : 'warning',
    dangerouslyUseHTMLString: false
  }).then(function(action) {
    if (action === 'confirm') {
      return action;
    }
    return Promise.reject();
  }).catch(function(action) {
    if (action === 'cancel' || action === 'close') {
      return Promise.reject();
    }
    return Promise.reject();
  });
}

function enqueuePrompt(config) {
  var ElMessageBox = getElMessageBox();
  if (!ElMessageBox) {
    return Promise.reject();
  }

  return ElMessageBox.prompt(config.text || '', config.title || '', {
    confirmButtonText: config.confirmButtonText || 'OK',
    cancelButtonText: config.cancelButtonText || 'Cancel',
    inputPlaceholder: config.placeholder || '',
    inputValue: config.defaultValue || '',
    dangerouslyUseHTMLString: false
  }).then(function(result) {
    if (result && result.value !== null && result.value !== undefined) {
      return result.value;
    }
    return Promise.reject();
  }).catch(function() {
    return Promise.reject();
  });
}

export var dialogState = {
  state: root.Vue.reactive({ current: null, queue: [] }),

  alert: function(config) {
    return enqueueAlert(config);
  },

  confirm: function(config) {
    return enqueueConfirm(config);
  },

  prompt: function(config) {
    return enqueuePrompt(config);
  },

  // 以下方法保留签名兼容性，ElMessageBox 不需要手动 settle
  confirmRequest: function() {},
  cancelRequest: function() {},
  clear: function() {
    var ElMessageBox = getElMessageBox();
    if (ElMessageBox) {
      ElMessageBox.close();
    }
  }
};
