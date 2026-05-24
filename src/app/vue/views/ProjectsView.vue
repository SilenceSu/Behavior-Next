<script lang="ts">
import { dialogService } from '../services/dialog.ts';
import { editorBridge } from '../services/editor-bridge.ts';
import { systemService } from '../services/system.ts';
import { notificationState } from '../state/notification-state.ts';
import { projectState } from '../state/project-state.ts';

var root = window;

// 项目列表页：负责创建、打开、保存、关闭和删除项目。
export default {
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
  }
};
</script>

<template>
<div class="page">
  <h1 class="header">Projects</h1>
  <nav class="page-operations">
    <div class="page-operations-content">
      <ul>
        <li v-if="isDesktop">
          <el-button @click="openProject()">
            <i class="fa fa-folder-open-o"></i> Open Project
          </el-button>
        </li>
        <li>
          <el-button type="success" @click="newProject()">
            <i class="fa fa-plus"></i> New Project
          </el-button>
        </li>
      </ul>
    </div>
  </nav>
  <div class="content">
    <el-empty v-if="!projectsState.recentProjects.length" description="You don't have any project yet." />

    <el-table
      v-if="projectsState.recentProjects.length"
      :data="projectsState.recentProjects"
      :row-class-name="(row) => row.row.isOpen ? 'current-project-row' : ''"
      style="width: 100%"
    >
      <el-table-column label="Project">
        <template #default="{ row }">
          <div v-if="row.isOpen">
            <el-tag type="success" size="small" style="margin-bottom: 4px;">Current project</el-tag>
            <div style="font-weight: 600; font-size: 15px; margin-top: 4px;">{{ row.name }}</div>
          </div>
          <div v-else style="font-size: 14px;">{{ row.name }}</div>
        </template>
      </el-table-column>

      <el-table-column label="Actions" width="320" align="right">
        <template #default="{ row }">
          <el-button-group v-if="row.isOpen">
            <el-button type="primary" size="small" @click="$router.push('/editor')">
              <i class="fa fa-arrow-circle-o-left"></i> Editor
            </el-button>
            <el-button type="success" size="small" @click="saveProject()">
              <i class="fa fa-save"></i> Save
            </el-button>
            <el-button size="small" @click="editProject()">
              <i class="fa fa-pencil"></i> Rename
            </el-button>
            <el-button size="small" @click="closeProject()">
              <i class="fa fa-close"></i> Close
            </el-button>
          </el-button-group>
          <el-button-group v-else>
            <el-button type="primary" size="small" @click="openProject(row.path)">
              <i class="fa fa-folder-open-o"></i> Open
            </el-button>
            <el-button type="danger" size="small" @click="removeProject(row.path)">
              <i class="fa fa-trash-o"></i> Remove
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
  </div>
</div>
</template>
