import { projectState } from '../state/project-state.js';

export var DashLayout = {
  name: 'DashLayout',

  setup: function() {
    return {
      projectState: projectState.state
    };
  },

  computed: {
    project: function() {
      return this.projectState.currentProject;
    }
  },

  template: '' +
    '<div>' +
    '  <div class="sidebar left">' +
    '    <div class="header-button" v-if="project">' +
    '      <router-link to="/editor"><i class="fa fa-arrow-circle-o-left"></i> Editor</router-link>' +
    '    </div>' +
    '    <div class="content" :class="{\'no-header\': !project}">' +
    '      <ul class="dash-menu">' +
    '        <li><router-link to="/dash/home">Home</router-link></li>' +
    '        <li><router-link to="/dash/projects">Projects</router-link></li>' +
    '        <li><router-link to="/dash/settings">Settings</router-link></li>' +
    '      </ul>' +
    '    </div>' +
    '  </div>' +
    '  <div class="dash-page">' +
    '    <router-view class="dash-anim"></router-view>' +
    '  </div>' +
    '</div>'
};
