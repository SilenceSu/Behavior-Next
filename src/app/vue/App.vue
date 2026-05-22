<script lang="ts">
import DialogHost from './components/DialogHost.vue';
import NotificationHost from './components/NotificationHost.vue';
import { initializeApp } from './state/app-init.ts';

// 应用根组件：挂载路由页面，并统一承载全局弹窗和通知。
export default {
  name: 'App',
  components: {
    DialogHost: DialogHost,
    NotificationHost: NotificationHost
  },

  mounted: function() {
    // Vue 挂载完成后再初始化旧编辑器桥接，确保 DOM 容器已存在。
    initializeApp();
  }
};
</script>

<template>
<div>
  <router-view class="app-anim"></router-view>
  <DialogHost></DialogHost>
  <NotificationHost></NotificationHost>
</div>
</template>
