import { DashLayout } from './layouts/DashLayout.js';
import { HomeView } from './views/HomeView.js';
import { ProjectsView } from './views/ProjectsView.js';
import { SettingsView } from './views/SettingsView.js';
import { EditorView } from './views/EditorView.js';
import { EditNodeModal } from './components/modals/EditNodeModal.js';
import { ExportModal } from './components/modals/ExportModal.js';
import { ImportModal } from './components/modals/ImportModal.js';

var VueRouter = window.VueRouter;

export var router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/dash/home' },
    {
      path: '/dash',
      component: DashLayout,
      redirect: '/dash/home',
      children: [
        { path: 'home', component: HomeView },
        { path: 'projects', component: ProjectsView },
        { path: 'settings', component: SettingsView }
      ]
    },
    {
      path: '/editor',
      component: EditorView,
      children: [
        { path: 'node/:name?', component: EditNodeModal },
        { path: 'export/:type/:format', component: ExportModal },
        { path: 'import/:type/:format', component: ImportModal }
      ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/dash/home' }
  ],
  linkActiveClass: 'active',
  linkExactActiveClass: 'active'
});
