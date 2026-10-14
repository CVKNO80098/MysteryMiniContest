/**
 * 当前用户状态（Pinia）
 *
 * 登录流程：登录页把用户名密码交给 src/api/user.ts → 后端查 user 表 → 返回用户信息
 * 登录校验（JWT什么的）暂时不做，时间不足，如果以后有机会了加个限时Token算了
 * 只把返回的用户信息存在这里（同时写进 localStorage），刷新页面不会丢
 * 退出就直接把信息清掉...如果后续加登录验证了可以再写个后端反馈的地方
 */
import { defineStore } from 'pinia'
import { login as loginRequest, registerUser, updateUser } from '@/api/user'
import type { User } from '@/types'
import { getStorage, removeStorage, setStorage } from '@/utils/storage'

const STORAGE_KEY = 'current-user'

export const useUserStore = defineStore('user', {
  state: () => ({
    /** 登录后的用户信息，没登录就是 null */
    currentUser: getStorage<User>(STORAGE_KEY),
  }),

  getters: {
    /** 是否已登录 */
    isLogin(state): boolean {
      return state.currentUser !== null
    },
    /** 当前用户 id，没登录时是 0 */
    userId(state): number {
      return state.currentUser ? state.currentUser.id : 0
    },
    /** 当前用户是不是骑手 */
    isRider(state): boolean {
      return state.currentUser ? state.currentUser.role === 2 : false
    },
    /** 当前用户是不是管理员 */
    isAdmin(state): boolean {
      return state.currentUser ? state.currentUser.role === 3 : false
    },
    /** 页面上显示的名字：优先昵称，没填就用真实姓名 */
    displayName(state): string {
      if (!state.currentUser) {
        return ''
      }
      return state.currentUser.nickname || state.currentUser.realName
    },
  },

  actions: {
    /**
     * 登录：把用户名密码发给后端
     * 返回用户对象表示成功，返回 null 表示用户名或密码不对
     */
    async login(username: string, password: string) {
      const user = await loginRequest(username, password)
      if (user) {
        this.setCurrentUser(user)
      }
      return user
    },

    /** 注册：成功返回新用户，用户名重复时返回 null */
    register(user: Partial<User>) {
      return registerUser(user)
    },

    /** 保存当前用户（登录成功、改资料后都调它） */
    setCurrentUser(user: User) {
      this.currentUser = user
      setStorage(STORAGE_KEY, user)
    },

    /** 修改个人资料 */
    async saveCurrentUser(user: User) {
      const result = await updateUser(user)
      this.setCurrentUser(result)
    },

    /** 退出登录：只清掉浏览器里的记录，后端不用管 */
    logout() {
      this.currentUser = null
      removeStorage(STORAGE_KEY)
    },
  },
})
