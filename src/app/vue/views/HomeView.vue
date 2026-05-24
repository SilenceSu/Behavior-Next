<script lang="ts">
var softwareItems = [
  { label: 'Software version', value: '[BUILD_VERSION]' },
  { label: 'Build date', value: '[BUILD_DATE]' },
  { label: 'Core runtime', value: 'Behavior Next Core (TypeScript)' },
  { label: 'Canvas layer', value: 'CreateJS rendering and interaction' }
];

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

var stackItems = [
  'Vue 3',
  'TypeScript',
  'Vite',
  'Electron',
  'Behavior Next Core',
  'Font Awesome 7'
];

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
        <router-link to="/dash/projects">
          <el-button type="success" size="large">
            <i class="fa fa-folder-open-o"></i> Projects
          </el-button>
        </router-link>
        <router-link to="/editor">
          <el-button type="primary" size="large">
            <i class="fa fa-pencil-square-o"></i> Editor
          </el-button>
        </router-link>
      </div>
    </section>

    <div class="home-grid">
      <el-card class="home-panel">
        <template #header><strong>Current Status</strong></template>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item
            v-for="item in softwareItems"
            :key="item.label"
            :label="item.label"
          >{{ item.value }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="home-panel">
        <template #header><strong>Modern Stack</strong></template>
        <div class="home-stack">
          <el-tag v-for="item in stackItems" :key="item" style="margin: 3px;">{{ item }}</el-tag>
        </div>
      </el-card>
    </div>

    <el-card class="home-panel" style="margin-top: 16px;">
      <template #header><strong>Core Capabilities</strong></template>
      <div class="home-capabilities">
        <article class="home-capability" v-for="item in capabilityItems" :key="item.title">
          <i :class="item.icon"></i>
          <div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.body }}</p>
          </div>
        </article>
      </div>
    </el-card>

    <el-card class="home-panel" style="margin-top: 16px; margin-bottom: 24px;">
      <template #header><strong>Maintenance Watch</strong></template>
      <el-timeline>
        <el-timeline-item
          v-for="item in maintenanceItems"
          :key="item.title"
          type="warning"
          hollow
        >
          <strong>{{ item.title }}</strong>
          <p style="margin: 4px 0 0; opacity: 0.75; font-size: 13px;">{{ item.body }}</p>
        </el-timeline-item>
      </el-timeline>
    </el-card>

  </div>
</div>
</template>
