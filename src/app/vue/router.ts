import { DashLayout } from './layouts/DashLayout.ts';
import { HomeView } from './views/HomeView.ts';
import { ProjectsView } from './views/ProjectsView.ts';
import { SettingsView } from './views/SettingsView.ts';
import { EditorView } from './views/EditorView.ts';
import { EditNodeModal } from './components/modals/EditNodeModal.ts';
import { ExportModal } from './components/modals/ExportModal.ts';
import { ImportModal } from './components/modals/ImportModal.ts';

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
