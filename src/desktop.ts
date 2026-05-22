'use strict';

var path = require('path');
var fs = require('fs');
var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var dialog = electron.dialog;
var ipcMain = electron.ipcMain;

var mainWindow = null;

function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function getDataPath() {
  var dataPath = process.env.APPDATA;
  if (!dataPath) {
    dataPath = path.join(process.env.HOME || app.getPath('home'), '.behavior3');
  }

  var appPath = path.join(dataPath, 'b3editor');
  ensureDirectory(dataPath);
  ensureDirectory(appPath);
  return appPath;
}

function getSystemInfo() {
  return {
    platform: process.platform,
    dataPath: getDataPath(),
    pathSeparator: path.sep
  };
}

function writeFileAtomically(filePath, content) {
  var tempPath = filePath + '~';
  var file = null;

  try {
    file = fs.openSync(tempPath, 'w');
    fs.writeSync(file, content);
  } finally {
    if (file !== null) {
      fs.closeSync(file);
    }
  }

  fs.renameSync(tempPath, filePath);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 1000,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload-electron.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

ipcMain.handle('b3-show-open-dialog', function(event, options) {
  var window = BrowserWindow.fromWebContents(event.sender);
  return dialog.showOpenDialog(window, options || {});
});

ipcMain.handle('b3-show-save-dialog', function(event, options) {
  var window = BrowserWindow.fromWebContents(event.sender);
  return dialog.showSaveDialog(window, options || {});
});

ipcMain.handle('b3-read-file', function(event, filePath) {
  return fs.readFileSync(filePath, 'utf-8');
});

ipcMain.handle('b3-write-file', function(event, filePath, content) {
  writeFileAtomically(filePath, content);
  return true;
});

ipcMain.handle('b3-remove-file', function(event, filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch (e) {}
  return true;
});

ipcMain.on('b3-get-system-info', function(event) {
  event.returnValue = getSystemInfo();
});

app.whenReady().then(createMainWindow);

app.on('activate', function() {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
