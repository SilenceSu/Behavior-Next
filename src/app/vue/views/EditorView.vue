<script lang="ts">
import Menubar from '../components/editor/Menubar.vue';
import NodesPanel from '../components/editor/NodesPanel.vue';
import PropertiesPanel from '../components/editor/PropertiesPanel.vue';

// 编辑器工作台布局：顶部菜单、左侧树/节点面板、右侧属性面板和中间画布区域。
export default {
  name: 'EditorView',
  components: {
    Menubar: Menubar,
    NodesPanel: NodesPanel,
    PropertiesPanel: PropertiesPanel
  }
};
</script>

<template>
<div>
  <Menubar></Menubar>
  <div class="sidebar left">
    <div class="content has-menubar">
      <NodesPanel></NodesPanel>
    </div>
  </div>
  <div class="sidebar right">
    <div class="content has-menubar">
      <PropertiesPanel></PropertiesPanel>
    </div>
  </div>
  <div class="editor-page">
    <router-view class="editor-anim"></router-view>
  </div>
</div>
</template>
