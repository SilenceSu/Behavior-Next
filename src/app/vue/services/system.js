import { nodejsService } from './nodejs.js';

var isDesktop = nodejsService.ok;

function trimTrailingSeparators(value, separator) {
  while (value.length > 1 && value.lastIndexOf(separator) === value.length - separator.length) {
    value = value.slice(0, -separator.length);
  }
  return value;
}

function trimLeadingSeparators(value, separator) {
  while (value.indexOf(separator) === 0) {
    value = value.slice(separator.length);
  }
  return value;
}

function getDataPath() {
  if (!isDesktop) {
    return 'b3editor';
  }

  return nodejsService.system.dataPath;
}

function join() {
  if (isDesktop && nodejsService.system && nodejsService.system.pathSeparator) {
    var separator = nodejsService.system.pathSeparator;
    var parts = Array.prototype.slice.call(arguments).filter(Boolean);
    if (!parts.length) {
      return '';
    }

    var value = trimTrailingSeparators(String(parts[0]), separator);
    for (var i = 1; i < parts.length; i++) {
      value += separator + trimLeadingSeparators(String(parts[i]), separator);
    }
    return value;
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
