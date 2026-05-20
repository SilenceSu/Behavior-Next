import {
  exposeStartApp,
  root,
  setEditor
} from './modules/compatibility.js';
import { mountVueApp } from './app/vue/main.js';

function startApp() {
  setEditor(new root.b3e.editor.Editor());
  mountVueApp('#app');
}

exposeStartApp(startApp);

export {
  startApp
};
