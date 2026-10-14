/**
 * 顾客端路由（首页、代取快递、校园外卖、小卖部、购物车、订单、个人中心）
 * 所有页面都套在 BasicLayout 里，共用顶部导航。
 *
 * meta.requiresLogin 表示“这个页面要有登录用户才能用”。
 * 注意：这只是前端的一句提示，不是安全校验——后端没有 token 也不做拦截。
 * 店铺列表（/food、/shop）不要求登录，可以先逛逛菜单。
 */
import type { RouteRecordRaw } from 'vue-router'
import BasicLayout from '@/layouts/BasicLayout.vue'

export const customerRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: BasicLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/home/HomeView.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'express',
        name: 'express',
        component: () => import('@/views/express/ExpressOrderView.vue'),
        meta: { title: '代取快递', requiresLogin: true },
      },
      // 外卖和小卖部页面是同一套组件，只是 shopType 不一样（2 外卖 / 3 小卖部）
      {
        path: 'food',
        name: 'food',
        component: () => import('@/views/store/StoreListView.vue'),
        props: { shopType: 2 },
        meta: { title: '校园外卖' },
      },
      {
        path: 'food/:shopId',
        name: 'foodGoods',
        component: () => import('@/views/store/StoreGoodsView.vue'),
        props: true,
        meta: { title: '商家点单', shopType: 2, requiresLogin: true },
      },
      {
        path: 'shop',
        name: 'shop',
        component: () => import('@/views/store/StoreListView.vue'),
        props: { shopType: 3 },
        meta: { title: '小卖部' },
      },
      {
        path: 'shop/:shopId',
        name: 'shopGoods',
        component: () => import('@/views/store/StoreGoodsView.vue'),
        props: true,
        meta: { title: '小卖部点单', shopType: 3, requiresLogin: true },
      },
      {
        path: 'cart',
        name: 'cart',
        component: () => import('@/views/cart/CartView.vue'),
        meta: { title: '购物车', requiresLogin: true },
      },
      {
        path: 'order',
        name: 'order',
        component: () => import('@/views/order/OrderListView.vue'),
        meta: { title: '我的订单', requiresLogin: true },
      },
      {
        path: 'order/:id',
        name: 'orderDetail',
        component: () => import('@/views/order/OrderDetailView.vue'),
        props: true,
        meta: { title: '订单详情', requiresLogin: true },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/profile/ProfileView.vue'),
        meta: { title: '个人中心', requiresLogin: true },
      },
    ],
  },
]
