<script lang="ts">
import { initializeApp } from './state/app-init.ts';

// 应用根组件：挂载路由页面。
// 弹窗和通知已由 Element Plus ElMessageBox / ElNotification 接管，无需独立宿主组件。
export default {
  name: 'App',

  mounted: function() {
    initializeApp();
  }
};
</script>

<template>
<div>
  <router-view class="app-anim"></router-view>
</div>
</template>
