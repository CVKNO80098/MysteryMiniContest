/**
 * 格式化工具
 * 页面上凡是“显示金额 / 显示时间”的地方，都调用这里的方法，不要各写一套，不然太乱了
 */

/** 金额格式化：12.5 → "12.50" */
export function formatMoney(value?: number | null): string {
  if (value === undefined || value === null) {
    return '0.00'
  }
  return Number(value).toFixed(2)
}

/** 时间格式化：把后端返回的 "2025-01-01T10:00:00" 显示成 "2025-01-01 10:00" */
export function formatTime(value?: string | null): string {
  if (!value) {
    return '-'
  }
  // 把 T 换成空格，再截掉秒，够用又好懂
  return value.replace('T', ' ').slice(0, 16)
}

/** 生成订单号（示例用，正式应该由后端生成） */
export function createOrderNo(): string {
  const now = new Date()
  const time =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0')
  const random = Math.floor(Math.random() * 9000 + 1000) // 4 位随机数
  return 'CD' + time + random
}

/** 当前时间，格式和后端 DATETIME 一致："2025-01-01 10:00:00" */
export function nowText(): string {
  const now = new Date()
  const date = now.toLocaleDateString('zh-CN').replace(/\//g, '-')
  const time = now.toLocaleTimeString('zh-CN', { hour12: false })
  return `${date} ${time}`
}
