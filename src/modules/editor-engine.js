import './compatibility.js';

import '../editor/namespaces.js';
import '../editor/utils/Block.js';
import '../editor/utils/Command.js';
import '../editor/utils/Connection.js';
import '../editor/utils/EditorError.js';
import '../editor/utils/functions.js';
import '../editor/utils/Node.js';
import '../editor/utils/Root.js';
import '../editor/utils/SelectionBox.js';
import '../editor/utils/settings.js';
import '../editor/utils/SettingsManager.js';
import '../editor/draw/shapes.js';
import '../editor/draw/symbols.js';
import '../editor/editor/Editor.js';
import '../editor/editor/managers/ExportManager.js';
import '../editor/editor/managers/ImportManager.js';
import '../editor/editor/managers/ProjectManager.js';
import '../editor/editor/managers/ShortcutManager.js';
import '../editor/editor/systems/CameraSystem.js';
import '../editor/editor/systems/CollapseSystem.js';
import '../editor/editor/systems/ConnectionSystem.js';
import '../editor/editor/systems/DragSystem.js';
import '../editor/editor/systems/SelectionSystem.js';
import '../editor/editor/systems/ShortcutSystem.js';
import '../editor/project/managers/HistoryManager.js';
import '../editor/project/managers/NodeManager.js';
import '../editor/project/managers/TreeManager.js';
import '../editor/project/Project.js';
import '../editor/tree/managers/BlockManager.js';
import '../editor/tree/managers/ConnectionManager.js';
import '../editor/tree/managers/EditManager.js';
import '../editor/tree/managers/OrganizeManager.js';
import '../editor/tree/managers/SelectionManager.js';
import '../editor/tree/managers/ViewManager.js';
import '../editor/tree/Tree.js';

var b3e = window.b3e;

export {
  b3e
};

export var Editor = b3e.editor.Editor;
export var Project = b3e.project.Project;
export var Tree = b3e.tree.Tree;
export var Block = b3e.Block;
export var Connection = b3e.Connection;
export var Node = b3e.Node;
export var Root = b3e.Root;
export var Command = b3e.Command;
export var Commands = b3e.Commands;
export var SelectionBox = b3e.SelectionBox;
export var SettingsManager = b3e.SettingsManager;
export var DEFAULT_SETTINGS = b3e.DEFAULT_SETTINGS;

export var editorManagers = b3e.editor;
export var projectManagers = b3e.project;
export var treeManagers = b3e.tree;
export var draw = b3e.draw;
