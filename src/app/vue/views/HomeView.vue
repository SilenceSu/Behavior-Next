<script lang="ts">
// 首页概览信息集中在脚本区，方便后续跟随 README 或构建状态同步调整。
var softwareItems = [
  { label: 'Software version', value: '[BUILD_VERSION]' },
  { label: 'Build date', value: '[BUILD_DATE]' },
  { label: 'Core runtime', value: 'Behavior Next Core (TypeScript)' },
  { label: 'Canvas layer', value: 'CreateJS rendering and interaction' }
];

// 核心能力只描述当前编辑器已经具备的稳定功能，避免继续展示旧项目的捐助和 wiki 信息。
var capabilityItems = [
  {
    icon: 'fa fa-sitemap',
    title: 'Behavior tree modeling',
    body: 'Compose roots, composites, decorators, actions and conditions in a visual editor.'
  },
  {
    icon: 'fa fa-code',
    title: 'Open JSON format',
    body: 'Import and export projects, trees and node definitions as portable JSON.'
  },
  {
    icon: 'fa fa-cubes',
    title: 'Custom nodes',
    body: 'Maintain node categories, titles, descriptions and custom properties per project.'
  },
  {
    icon: 'fa fa-desktop',
    title: 'Web and desktop',
    body: 'Run in a browser during development or package the same workbench with Electron.'
  }
];

// 技术栈摘要突出当前项目已经完成现代化的部分，CreateJS 单独说明为保留的画布层依赖。
var stackItems = [
  'Vue 3',
  'TypeScript',
  'Vite',
  'Electron',
  'Behavior Next Core',
  'Font Awesome 7'
];

// 维护关注点保留在首页，便于进入项目时快速看到仍需长期评估的方向。
var maintenanceItems = [
  {
    title: 'CreateJS canvas layer',
    body: 'Retained for the editor canvas and pointer interaction while future canvas evolution is evaluated.'
  },
  {
    title: 'Less style chain',
    body: 'Kept as the shared theme layer for now; can be revisited after the Vue interface stabilizes.'
  }
];

// 首页视图：作为进入工作台后的项目状态概览，不承担项目管理和编辑器画布逻辑。
export default {
  name: 'HomeView',

  data: function() {
    return {
      softwareItems: softwareItems,
      capabilityItems: capabilityItems,
      stackItems: stackItems,
      maintenanceItems: maintenanceItems
    };
  }
};
</script>

<template>
<div class="page home-page">
  <h1 class="header"><strong>Behavior</strong> Next</h1>
  <div class="content home-content">
    <!-- 项目定位：替换旧 Behavior3 介绍，说明当前项目已经转向 Behavior Next。 -->
    <section class="home-intro">
      <div class="home-intro-copy">
        <small>Visual behavior tree workbench</small>
        <h2>Modern editing for behavior trees</h2>
        <p>
          Behavior Next is a modern visual workbench for editing behavior trees.
          It runs on a Vue 3, TypeScript, Vite and Electron workflow, keeps an
          open JSON model, and maintains the core behavior runtime as TypeScript
          modules.
        </p>
      </div>
      <div class="home-actions" aria-label="Primary actions">
        <router-link class="b3-button b3-button-confirm" to="/dash/projects">
          <i class="fa fa-folder-open-o"></i>
          Projects
        </router-link>
        <router-link class="b3-button b3-button-accent" to="/editor">
          <i class="fa fa-pencil-square-o"></i>
          Editor
        </router-link>
      </div>
    </section>

    <div class="home-grid">
      <!-- 构建与运行时信息：保留构建占位符，生产构建时由 legacy-build 替换。 -->
      <section class="b3-box home-panel">
        <div class="b3-box-head"><strong>Current Status</strong></div>
        <ul class="b3-stack home-status-list">
          <li class="b3-stack-entry" v-for="item in softwareItems" :key="item.label">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </li>
        </ul>
      </section>

      <!-- 技术栈摘要：展示当前现代化后的主要维护面。 -->
      <section class="b3-box home-panel">
        <div class="b3-box-head"><strong>Modern Stack</strong></div>
        <div class="home-stack">
          <span v-for="item in stackItems" :key="item">{{ item }}</span>
        </div>
      </section>
    </div>

    <!-- 核心能力：用紧凑列表替代旧的贡献链接区。 -->
    <section class="b3-box home-panel">
      <div class="b3-box-head"><strong>Core Capabilities</strong></div>
      <div class="home-capabilities">
        <article class="home-capability" v-for="item in capabilityItems" :key="item.title">
          <i :class="item.icon"></i>
          <div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.body }}</p>
          </div>
        </article>
      </div>
    </section>

    <!-- 后续维护关注点：明确当前仍保留但不阻塞现代化状态的依赖方向。 -->
    <section class="b3-box home-panel">
      <div class="b3-box-head"><strong>Maintenance Watch</strong></div>
      <ul class="b3-stack">
        <li class="b3-stack-entry home-maintenance" v-for="item in maintenanceItems" :key="item.title">
          <strong>{{ item.title }}</strong>
          <p>{{ item.body }}</p>
        </li>
      </ul>
    </section>
  </div>
</div>
</template>
