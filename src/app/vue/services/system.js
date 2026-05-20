import { nodejsService } from './nodejs.js';

var root = window;
var isDesktop = !!root.process && nodejsService.ok;

function createIfMissing(path) {
  if (!isDesktop || !nodejsService.fs) {
    return;
  }

  try {
    nodejsService.fs.statSync(path);
  } catch (e) {
    nodejsService.fs.mkdirSync(path);
  }
}

function getDataPath() {
  if (!isDesktop) {
    return 'b3editor';
  }

  var dataPath = root.process.env.APPDATA;
  if (!dataPath) {
    dataPath = root.process.env.HOME + '/.behavior3';
  }

  var appPath = join(dataPath, 'b3editor');
  createIfMissing(dataPath);
  createIfMissing(appPath);
  return appPath;
}

function join() {
  if (isDesktop && nodejsService.path) {
    return nodejsService.path.join.apply(nodejsService.path, arguments);
  }

  var value = arguments[0];
  for (var i = 1; i < arguments.length; i++) {
    value += '-' + arguments[i];
  }
  return value;
}

export var systemService = {
  isDesktop: isDesktop,
  getDataPath: getDataPath,
  join: join
};
