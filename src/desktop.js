'use strict';

var path = require('path');
var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var dialog = electron.dialog;
var ipcMain = electron.ipcMain;

var mainWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 1000,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
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
