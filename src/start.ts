import {
  exposeStartApp,
  root,
  setEditor
} from './modules/compatibility.ts';
import { mountVueApp } from './app/vue/main.ts';

function startApp() {
  setEditor(new root.b3e.editor.Editor());
  mountVueApp('#app');
}

exposeStartApp(startApp);

export {
  startApp
};
