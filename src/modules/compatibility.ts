var root = window;

root.b3e = root.b3e || {};
root.b3e.draw = root.b3e.draw || {};
root.b3e.editor = root.b3e.editor || {};
root.b3e.project = root.b3e.project || {};
root.b3e.tree = root.b3e.tree || {};

function setEditor(editor) {
  root.editor = editor;
  return editor;
}

function exposeStartApp(startApp) {
  root.startApp = startApp;
  return startApp;
}

export {
  root,
  setEditor,
  exposeStartApp
};
