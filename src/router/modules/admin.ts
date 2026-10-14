/**
 * 管理端路由（数据概览、商品管理、订单管理、用户管理）
 * 管理端用单独的 AdminLayout（左侧菜单），和顾客端分开。
 */
import type { RouteRecordRaw } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresLogin: true },
    children: [
      {
        path: '',
        name: 'adminHome',
        component: () => import('@/views/admin/AdminHomeView.vue'),
        meta: { title: '数据概览' },
      },
      {
        path: 'goods',
        name: 'adminGoods',
        component: () => import('@/views/admin/AdminGoodsView.vue'),
        meta: { title: '商品管理' },
      },
      {
        path: 'orders',
        name: 'adminOrders',
        component: () => import('@/views/admin/AdminOrderView.vue'),
        meta: { title: '订单管理' },
      },
      {
        path: 'users',
        name: 'adminUsers',
        component: () => import('@/views/admin/AdminUserView.vue'),
        meta: { title: '用户管理' },
      },
    ],
  },
]
