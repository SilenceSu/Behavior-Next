/**
 * 创建与旧 Behavior3JS 兼容的 UUID 字符串。
 *
 * 该实现保留原库的随机 UUID 生成策略，用于项目、树、节点和块的 ID。
 * 它不是加密安全随机数，只用于编辑器内对象标识。
 */
export function createUUID(): string {
  var s: string[] = [];
  var hexDigits = "0123456789abcdef";

  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }

  // UUID v4 固定版本位。
  s[14] = "4";

  // UUID variant 位。
  s[19] = hexDigits.substr((parseInt(s[19], 16) & 0x3) | 0x8, 1);
  s[8] = s[13] = s[18] = s[23] = "-";

  return s.join("");
}
