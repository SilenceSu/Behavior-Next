<script lang="ts">
import { projectState } from '../state/project-state.ts';

// 仪表盘布局：承载首页、项目列表和设置页，并在有项目时提供回到编辑器入口。
export default {
  name: 'DashLayout',

  setup: function() {
    return {
      projectState: projectState.state
    };
  },

  computed: {
    project: function() {
      // currentProject 来自共享项目状态，用于控制左侧返回编辑器按钮。
      return this.projectState.currentProject;
    }
  }
};
</script>

<template>
<div>
  <div class="sidebar left">
    <div class="header-button" v-if="project">
      <router-link to="/editor"><i class="fa fa-arrow-circle-o-left"></i> Editor</router-link>
    </div>
    <div class="content" :class="{'no-header': !project}">
      <ul class="dash-menu">
        <li><router-link to="/dash/home">Home</router-link></li>
        <li><router-link to="/dash/projects">Projects</router-link></li>
        <li><router-link to="/dash/settings">Settings</router-link></li>
      </ul>
    </div>
  </div>
  <div class="dash-page">
    <router-view class="dash-anim"></router-view>
  </div>
</div>
</template>
