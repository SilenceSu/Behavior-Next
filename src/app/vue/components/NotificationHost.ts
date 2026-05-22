import { notificationState } from '../state/notification-state.ts';

export var NotificationHost = {
  name: 'NotificationHost',

  setup: function() {
    return {
      state: notificationState.state,
      remove: notificationState.remove
    };
  },

  methods: {
    bottom: function(index) {
      return (20 + index * 80) + 'px';
    }
  },

  template: '' +
    '<div>' +
    '  <div v-for="(item, index) in state.notifications" :key="item.id" class="notification" :class="[item.type, {started:item.started, killed:item.killed}]" :style="{bottom: bottom(index)}" @click="remove(item)">' +
    '    <div class="notification-icon" v-if="item.icon"><i class="fa fa-fw" :class="item.icon"></i></div>' +
    '    <div class="notification-content" :class="{\'has-icon\': item.icon}">' +
    '      <div class="notification-title" v-if="item.title" v-html="item.title"></div>' +
    '      <div class="notification-message" v-html="item.message"></div>' +
    '    </div>' +
    '  </div>' +
    '</div>'
};
