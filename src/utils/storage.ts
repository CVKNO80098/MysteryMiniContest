/**
 * localStorage简单封装
 */

const PREFIX = 'campus-errand-' // 统一前缀，避免和别的项目冲突

/** 保存数据 */
export function setStorage(key: string, value: unknown): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

/** 读取数据，读不到返回 null */
export function getStorage<T>(key: string): T | null {
  const text = localStorage.getItem(PREFIX + key)
  if (!text) {
    return null
  }
  try {
    return JSON.parse(text) as T
  } catch {
    // 存进去的不是合法JSON则输出警告
    window.console.warn(`localStorage 里 ${PREFIX + key} 不是合法 JSON，未储存`)
    return null
  }
}

/** 删除数据 */
export function removeStorage(key: string): void {
  localStorage.removeItem(PREFIX + key)
}
