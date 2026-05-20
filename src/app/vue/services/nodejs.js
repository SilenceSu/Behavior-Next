var root = window;

function loadNodeService() {
  var ok = !!root.require;
  var service = {
    ok: ok,
    fs: null,
    path: null,
    dialog: null
  };

  if (!ok) {
    return service;
  }

  try {
    service.fs = root.require('fs');
    service.path = root.require('path');
  } catch (e) {}

  if (root.electronDialog) {
    service.dialog = root.electronDialog;
  }

  if (!service.dialog) {
    try {
      var remote = root.require('remote');
      service.dialog = remote.require('dialog');
    } catch (e) {}
  }

  if (!service.dialog) {
    try {
      var electron = root.require('electron');
      service.dialog = electron.dialog || (electron.remote && electron.remote.dialog);
    } catch (ignored) {}
  }

  return service;
}

export var nodejsService = loadNodeService();
