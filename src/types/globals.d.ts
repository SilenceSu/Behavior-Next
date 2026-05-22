declare var b3e: any;
declare var b3: any;
declare var createjs: any;
declare var JSON3: any;
declare var require: any;
declare var module: any;
declare var process: any;
declare var __dirname: string;

declare function preloadProgress(message: string): void;

interface Window {
  Vue: any;
  VueRouter: any;
  b3e: any;
  b3: any;
  editor: any;
  startApp: any;
  b3Electron: any;
  require?: any;
}

declare module "*.vue" {
  const component: any;
  export default component;
}
