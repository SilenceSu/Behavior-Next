import './compatibility.ts';

import '../editor/namespaces.ts';
import '../editor/runtime/Runtime.ts';
import '../editor/utils/Block.ts';
import '../editor/utils/Command.ts';
import '../editor/utils/Connection.ts';
import '../editor/utils/EditorError.ts';
import '../editor/utils/functions.ts';
import '../editor/utils/Node.ts';
import '../editor/utils/Root.ts';
import '../editor/utils/SelectionBox.ts';
import '../editor/utils/settings.ts';
import '../editor/utils/SettingsManager.ts';
import '../editor/draw/shapes.ts';
import '../editor/draw/symbols.ts';
import '../editor/editor/Editor.ts';
import '../editor/editor/managers/ExportManager.ts';
import '../editor/editor/managers/ImportManager.ts';
import '../editor/editor/managers/ProjectManager.ts';
import '../editor/editor/managers/ShortcutManager.ts';
import '../editor/editor/systems/CameraSystem.ts';
import '../editor/editor/systems/CollapseSystem.ts';
import '../editor/editor/systems/ConnectionSystem.ts';
import '../editor/editor/systems/DragSystem.ts';
import '../editor/editor/systems/SelectionSystem.ts';
import '../editor/editor/systems/ShortcutSystem.ts';
import '../editor/project/managers/HistoryManager.ts';
import '../editor/project/managers/NodeManager.ts';
import '../editor/project/managers/TreeManager.ts';
import '../editor/project/Project.ts';
import '../editor/tree/managers/BlockManager.ts';
import '../editor/tree/managers/ConnectionManager.ts';
import '../editor/tree/managers/EditManager.ts';
import '../editor/tree/managers/OrganizeManager.ts';
import '../editor/tree/managers/SelectionManager.ts';
import '../editor/tree/managers/ViewManager.ts';
import '../editor/tree/Tree.ts';

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
