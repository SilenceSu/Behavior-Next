/**
 * 兼容旧 Behavior3JS 的 b3.Class(BaseClass) 工厂。
 *
 * 旧项目可能用这种方式定义自定义节点：
 *
 * var MyNode = b3.Class(b3.Action);
 * MyNode.prototype.initialize = function(settings) {};
 *
 * TypeScript core 本身使用 class 语法，但兼容层仍暴露 b3.Class，避免
 * 旧自定义节点代码在迁移初期无法加载。
 */
export function legacyClass(baseClass?: any): any {
  var cls = function(this: any, params?: any) {
    this.initialize(params);
  };

  // 有父类时按旧库方式建立 prototype 继承链。
  if (baseClass) {
    cls.prototype = Object.create(baseClass.prototype);
    cls.prototype.constructor = cls;
  }

  // 旧 b3.Class 保证每个类都有 initialize，构造时只调用 initialize。
  if (!cls.prototype.initialize) {
    cls.prototype.initialize = function() {};
  }

  return cls;
}
