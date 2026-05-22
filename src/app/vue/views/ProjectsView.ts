import { dialogService } from '../services/dialog.ts';
import { editorBridge } from '../services/editor-bridge.ts';
import { systemService } from '../services/system.ts';
import { notificationState } from '../state/notification-state.ts';
import { projectState } from '../state/project-state.ts';

var root = window;

export var ProjectsView = {
  name: 'ProjectsView',

  setup: function() {
    return {
      projectsState: projectState.state,
      isDesktop: systemService.isDesktop
    };
  },

  mounted: function() {
    projectState.getRecentProjects();
  },

  methods: {
    createUuid: function() {
      return root.b3 && root.b3.createUUID ? root.b3.createUUID() : String(Date.now());
    },

    doNewProject: function(path, name) {
      var self = this;
      return projectState
        .newProject(path, name)
        .then(function() {
          self.$router.push('/editor');
        });
    },

    newProject: function() {
      var self = this;
      var doNew = function() {
        dialogService
          .prompt('New project', null, 'input', 'Project name')
          .then(function(name) {
            if (!name) {
              notificationState.error('Invalid name', 'You must provide a name for the project.');
              return;
            }

            if (self.isDesktop) {
              var placeholder = name.replace(/\s+/g, '_').toLowerCase();
              dialogService
                .saveAs(placeholder, ['.b3', '.json'])
                .then(function(path) {
                  self.doNewProject(path, name);
                });
            } else {
              self.doNewProject('b3projects-' + self.createUuid(), name);
            }
          });
      };

      if (editorBridge.isDirty()) {
        dialogService
          .confirm('Leave without saving?', 'If you proceed you will lose all unsaved modifications.', null, { closeOnConfirm: false })
          .then(doNew);
      } else {
        doNew();
      }
    },

    doOpenProject: function(path) {
      var self = this;
      projectState
        .openProject(path)
        .then(function() {
          self.$router.push('/editor');
        }, function() {
          notificationState.error('Invalid file', "Couldn't open the project file.");
        });
    },

    openProject: function(path) {
      var self = this;
      var doOpen = function() {
        if (path) {
          self.doOpenProject(path);
        } else {
          dialogService.openFile(false, ['.b3', '.json']).then(function(selectedPath) {
            self.doOpenProject(selectedPath);
          });
        }
      };

      if (editorBridge.isDirty()) {
        dialogService
          .confirm('Leave without saving?', 'If you proceed you will lose all unsaved modifications.')
          .then(doOpen);
      } else {
        doOpen();
      }
    },

    editProject: function() {
      var project = projectState.getProject();
      dialogService
        .prompt('Rename project', null, 'input', project.name)
        .then(function(name) {
          if (!name) {
            notificationState.error('Invalid name', 'You must provide a name for the project.');
            return;
          }

          project.name = name;
          projectState
            .saveProject(project)
            .then(function() {
              notificationState.success('Project renamed', 'The project has been renamed successfully.');
            });
        });
    },

    saveProject: function() {
      projectState
        .saveProject()
        .then(function() {
          notificationState.success('Project saved', 'The project has been saved');
        }, function() {
          notificationState.error('Error', "Project couldn't be saved");
        });
    },

    closeProject: function() {
      var doClose = function() {
        projectState.closeProject();
      };

      if (editorBridge.isDirty()) {
        dialogService
          .confirm('Leave without saving?', 'If you proceed you will lose all unsaved modifications.', null)
          .then(doClose);
      } else {
        doClose();
      }
    },

    removeProject: function(path) {
      dialogService
        .confirm('Remove project?', 'Are you sure you want to remove this project?')
        .then(function() {
          projectState
            .removeProject(path)
            .then(function() {
              notificationState.success('Project removed', 'The project has been removed from editor.');
            });
        });
    }
  },

  template: '' +
    '<div class="page">' +
    '  <h1 class="header">Projects</h1>' +
    '  <nav class="page-operations">' +
    '    <div class="page-operations-content">' +
    '      <ul>' +
    '        <li v-if="isDesktop"><button class="b3-button b3-button-neutral" @click="openProject()"><i class="fa fa-folder-open-o"></i> Open Project</button></li>' +
    '        <li><button class="b3-button b3-button-confirm" @click="newProject()"><i class="fa fa-plus"></i> New Project</button></li>' +
    '      </ul>' +
    '    </div>' +
    '  </nav>' +
    '  <div class="content">' +
    "    <div v-if=\"!projectsState.recentProjects.length\"><p>You don't have any project yet.</p></div>" +
    '    <table class="b3-data-sheet b3-data-sheet-striped" v-if="projectsState.recentProjects.length">' +
    '      <tr v-for="(item, index) in projectsState.recentProjects" :key="index" :class="{\'b3-state-current\': item.isOpen}">' +
    '        <td v-if="item.isOpen" class="b3-state-current">' +
    '          <div class="b3-action-group b3-float-right" role="group">' +
    '            <router-link class="b3-button b3-button-accent" to="/editor"><i class="fa fa-arrow-circle-o-left"></i> Editor</router-link>' +
    '            <button type="button" class="b3-button b3-button-confirm" @click="saveProject()"><i class="fa fa-save"></i> Save</button>' +
    '            <button type="button" class="b3-button b3-button-neutral" @click="editProject()"><i class="fa fa-pencil"></i> Rename</button>' +
    '            <button type="button" class="b3-button b3-button-neutral" @click="closeProject()"><i class="fa fa-close"></i> Close</button>' +
    '          </div>' +
    '          <small><em>Current project</em></small>' +
    '          <h3 class="current-project">{{ item.name }}</h3>' +
    '        </td>' +
    '        <td v-else>' +
    '          <div class="b3-action-group b3-float-right" role="group">' +
    '            <button type="button" class="b3-button b3-button-accent b3-button-small" @click="openProject(item.path)"><i class="fa fa-folder-open-o"></i> Open</button>' +
    '            <button type="button" class="b3-button b3-button-danger b3-button-small" @click="removeProject(item.path)"><i class="fa fa-trash-o"></i> Remove</button>' +
    '          </div>' +
    '          <p>{{ item.name }}</p>' +
    '        </td>' +
    '      </tr>' +
    '    </table>' +
    '  </div>' +
    '</div>'
};
