var root = window;

function loadNodeService() {
  var api = root.b3Electron || null;
  var ok = !!api && api.ok !== false;
  var service = {
    ok: ok,
    dialog: null,
    storage: null,
    system: null
  };

  if (!ok) {
    return service;
  }

  service.dialog = api.dialog || null;
  service.storage = api.storage || null;
  service.system = api.system || null;

  return service;
}

export var nodejsService = loadNodeService();
