import { DialogHost } from './components/DialogHost.js';
import { NotificationHost } from './components/NotificationHost.js';
import { initializeApp } from './state/app-init.js';

export var App = {
  name: 'App',
  components: {
    DialogHost: DialogHost,
    NotificationHost: NotificationHost
  },

  mounted: function() {
    initializeApp();
  },

  template: '' +
    '<div>' +
    '  <router-view class="app-anim"></router-view>' +
    '  <DialogHost></DialogHost>' +
    '  <NotificationHost></NotificationHost>' +
    '</div>'
};
