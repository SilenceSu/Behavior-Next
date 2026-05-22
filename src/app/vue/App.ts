import { DialogHost } from './components/DialogHost.ts';
import { NotificationHost } from './components/NotificationHost.ts';
import { initializeApp } from './state/app-init.ts';

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
