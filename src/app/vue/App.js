import { NotificationHost } from './components/NotificationHost.js';
import { initializeApp } from './state/app-init.js';

export var App = {
  name: 'App',
  components: {
    NotificationHost: NotificationHost
  },

  mounted: function() {
    initializeApp();
  },

  template: '' +
    '<div>' +
    '  <router-view class="app-anim"></router-view>' +
    '  <NotificationHost></NotificationHost>' +
    '</div>'
};
