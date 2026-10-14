/**
 * 骑手端路由（接单大厅、我的跑腿）
 * 骑手端也用 BasicLayout，只有骑手身份的账号才能看到顶部入口（菜单里做了判断）。
 */
import type { RouteRecordRaw } from 'vue-router'
import BasicLayout from '@/layouts/BasicLayout.vue'

export const riderRoutes: RouteRecordRaw[] = [
  {
    path: '/rider',
    component: BasicLayout,
    meta: { requiresLogin: true },
    children: [
      {
        path: '',
        name: 'riderHall',
        component: () => import('@/views/rider/RiderHallView.vue'),
        meta: { title: '接单大厅' },
      },
      {
        path: 'mine',
        name: 'riderMine',
        component: () => import('@/views/rider/RiderOrderView.vue'),
        meta: { title: '我的跑腿' },
      },
    ],
  },
]
