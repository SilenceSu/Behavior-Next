import { Menubar } from '../components/editor/Menubar.js';
import { NodesPanel } from '../components/editor/NodesPanel.js';
import { PropertiesPanel } from '../components/editor/PropertiesPanel.js';

export var EditorView = {
  name: 'EditorView',
  components: {
    Menubar: Menubar,
    NodesPanel: NodesPanel,
    PropertiesPanel: PropertiesPanel
  },

  template: '' +
    '<div>' +
    '  <Menubar></Menubar>' +
    '  <div class="sidebar left">' +
    '    <div class="content has-menubar">' +
    '      <NodesPanel></NodesPanel>' +
    '    </div>' +
    '  </div>' +
    '  <div class="sidebar right">' +
    '    <div class="content has-menubar">' +
    '      <PropertiesPanel></PropertiesPanel>' +
    '    </div>' +
    '  </div>' +
    '  <div class="editor-page">' +
    '    <router-view class="editor-anim"></router-view>' +
    '  </div>' +
    '</div>'
};
