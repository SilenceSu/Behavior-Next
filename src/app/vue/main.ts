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

  // 注册 Element Plus（通过全局 IIFE 变量）
  if (root.ElementPlus) {
    app.use(root.ElementPlus);
  }

  // 注册 Element Plus 图标（通过全局 IIFE 变量）
  if (root.ElementPlusIconsVue) {
    Object.keys(root.ElementPlusIconsVue).forEach(function(key) {
      app.component(key, root.ElementPlusIconsVue[key]);
    });
  }

  app.directive('drag-node', dragNodeDirective);
  app.directive('drop-node', dropNodeDirective);
  var component = app.mount(selector || '#app');
  mountedApp = app;
  return component;
}
