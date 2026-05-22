<script lang="ts">
import { notificationState } from '../state/notification-state.ts';

// 全局通知宿主：渲染通知队列，并按队列位置错开显示。
export default {
  name: 'NotificationHost',

  setup: function() {
    return {
      state: notificationState.state,
      remove: notificationState.remove
    };
  },

  methods: {
    bottom: function(index) {
      // 每条通知向上错开，避免多条通知互相遮挡。
      return (20 + index * 80) + 'px';
    }
  }
};
</script>

<template>
<div>
  <div v-for="(item, index) in state.notifications" :key="item.id" class="notification" :class="[item.type, {started:item.started, killed:item.killed}]" :style="{bottom: bottom(index)}" @click="remove(item)">
    <div class="notification-icon" v-if="item.icon"><i class="fa fa-fw" :class="item.icon"></i></div>
    <div class="notification-content" :class="{'has-icon': item.icon}">
      <div class="notification-title" v-if="item.title" v-html="item.title"></div>
      <div class="notification-message" v-html="item.message"></div>
    </div>
  </div>
</div>
</template>
