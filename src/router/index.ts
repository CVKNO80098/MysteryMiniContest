/**
 * 路由总入口
 * 结构：合并 modules 四张路由表 → 网页标题 → 守卫里判断要不要登录
 * 路由表按“账号 / 顾客端 / 骑手端 / 管理端”分成四个文件放在 modules 目录
 * 发现了一个很好玩的，我一直以为这玩意只能写在一个文件里面...结果居然可以拆开！
 * 这里只负责把它们合起来，并统一设置网页标题
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { accountRoutes } from './modules/account'
import { adminRoutes } from './modules/admin'
import { customerRoutes } from './modules/customer'
import { riderRoutes } from './modules/rider'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...accountRoutes,
    ...customerRoutes,
    ...riderRoutes,
    ...adminRoutes,
    // 上面都没匹配到，就跳到 404 页面
    { path: '/:pathMatch(.*)*', redirect: '/404' },
  ],
  // 切换页面后回到顶部
  scrollBehavior() {
    return { top: 0 }
  },
})

/**
 * 全局前置守卫
 *
 * 完成内容：
 *   1. 根据路由的 meta.title 改浏览器标签文字；
 *   2. 标记了 requiresLogin 的页面，没有登录用户就先跳去登录页。
 *
 * 2：并非安全校验，安全校验没写，时间不够，此处只是确保功能完整性
 * 本项目没有 JWT、没有 token、没有后端拦截器，用户信息就存在浏览器里（localStorage）
 */
router.beforeEach((to, _from, next) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} - 校园跑腿` : '校园跑腿平台'

  if (to.meta.requiresLogin && !useUserStore().currentUser) {
    // 记录原本将去的页面，登录成功后跳回去
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  next()
})

export default router
