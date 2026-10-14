/**
 * 账号相关路由（登录、注册）和 404 页面
 * 这两个页面不套布局，单独一个页面居中显示。
 */
import type { RouteRecordRaw } from 'vue-router'

export const accountRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/login/RegisterView.vue'),
    meta: { title: '注册' },
  },
  {
    path: '/404',
    name: 'notFound',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: { title: '页面不存在' },
  },
]
