import App from './App.vue';
import { router } from './router.ts';
import { dragNodeDirective } from './directives/drag-node.ts';
import { dropNodeDirective } from './directives/drop-node.ts';

var root = window;
var mountedApp = null;

export function mountVueApp(selector) {
  if (mountedApp) {
    mountedApp.unmount();
    mountedApp = null;
  }

  var app = root.Vue.createApp(App);
  app.use(router);
  app.directive('drag-node', dragNodeDirective);
  app.directive('drop-node', dropNodeDirective);
  var component = app.mount(selector || '#app');
  mountedApp = app;
  return component;
}
