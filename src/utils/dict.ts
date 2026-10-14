/**
 * 数据字典
 */
import type { OrderStatus, OrderType, UserRole } from '@/types'

/** 订单状态文字 */
export const ORDER_STATUS_TEXT: Record<OrderStatus, string> = {
  0: '待支付',
  1: '待接单',
  2: '配送中',
  3: '已完成',
  4: '已取消',
}

/** el-tag 组件支持的颜色，写成类型是为了方便TS帮忙检查拼写... */
export type TagColor = 'primary' | 'success' | 'info' | 'warning' | 'danger'

/** 订单状态颜色（Element Plus 的 el-tag 颜色） */
export const ORDER_STATUS_COLOR: Record<OrderStatus, TagColor> = {
  0: 'info',
  1: 'warning',
  2: 'primary',
  3: 'success',
  4: 'info',
}

/** 订单类型文字 */
export const ORDER_TYPE_TEXT: Record<OrderType, string> = {
  1: '代取快递',
  2: '校园外卖',
  3: '小卖部',
}

/** 用户角色文字 */
export const USER_ROLE_TEXT: Record<UserRole, string> = {
  1: '顾客',
  2: '骑手',
  3: '管理员',
}

/** 包裹大小文字 */
export const PACKAGE_SIZE_TEXT: Record<number, string> = {
  1: '小件',
  2: '中件',
  3: '大件',
}

/** 取订单状态文字，传进来的值不认识时显示“未知” */
export function getOrderStatusText(status: OrderStatus): string {
  return ORDER_STATUS_TEXT[status] || '未知'
}

/** 取订单状态颜色 */
export function getOrderStatusColor(status: OrderStatus): TagColor {
  return ORDER_STATUS_COLOR[status] || 'info'
}

/** 取订单类型文字 */
export function getOrderTypeText(type: OrderType): string {
  return ORDER_TYPE_TEXT[type] || '未知'
}

/** 取用户角色文字 */
export function getUserRoleText(role: UserRole): string {
  return USER_ROLE_TEXT[role] || '未知'
}
