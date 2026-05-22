import DashLayout from './layouts/DashLayout.vue';
import HomeView from './views/HomeView.vue';
import ProjectsView from './views/ProjectsView.vue';
import SettingsView from './views/SettingsView.vue';
import EditorView from './views/EditorView.vue';
import EditNodeModal from './components/modals/EditNodeModal.vue';
import ExportModal from './components/modals/ExportModal.vue';
import ImportModal from './components/modals/ImportModal.vue';

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
