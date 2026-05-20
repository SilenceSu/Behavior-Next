import {
  exposeStartApp,
  root,
  setEditor
} from './modules/compatibility.js';

function startApp() {
  var domProgress = document.getElementById('page-preload');
  
  setEditor(new root.b3e.editor.Editor());
  root.angular.bootstrap(root.document, ['app']);
}

exposeStartApp(startApp);

export {
  startApp
};
