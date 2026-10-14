/**
 * 用户相关接口（含登录、注册）
 * 路径和 src/api/mock.ts 里的假数据一一对应
 */
import { USE_MOCK } from '@/config'
import type { User } from '@/types'
import { mockUserList } from './mock'
import { http } from './request'

/**
 * 登录
 * 查不到返回 code = 500、msg = "用户名或密码错误"
 * 无需多言
 */
export function login(username: string, password: string) {
  if (USE_MOCK) {
    // 假数据里三个演示账号的密码都是 123456，用户名或密码不对就返回 null
    const user = mockUserList.find(
      (item) => item.username === username && item.password === password,
    )
    return Promise.resolve(user || null)
  }
  return http.post<User | null>('/user/login', { username, password })
}

/**
 * 注册
 * 用户名已存在时返回 code = 500、msg = "用户名已存在"
 */
export function registerUser(user: Partial<User>) {
  if (USE_MOCK) {
    const exist = mockUserList.some((item) => item.username === user.username)
    if (exist) {
      return Promise.resolve<User | null>(null)
    }
    const newUser = {
      ...user,
      id: Date.now(),
      role: 1,
      balance: 0,
      status: 1,
    } as User
    mockUserList.push(newUser)
    return Promise.resolve<User | null>(newUser)
  }
  return http.post<User | null>('/user/register', user)
}

/** 查询全部用户（管理端页面可能会用到..吗） */
export function getUserList() {
  if (USE_MOCK) {
    return Promise.resolve([...mockUserList])
  }
  return http.get<User[]>('/user/list')
}

/** 根据 id 查询用户 */
export function getUserById(id: number) {
  if (USE_MOCK) {
    return Promise.resolve(mockUserList.find((user) => user.id === id) || null)
  }
  return http.get<User | null>(`/user/${id}`)
}

/** 修改用户信息（昵称、手机号、头像等） */
export function updateUser(user: User) {
  if (USE_MOCK) {
    const index = mockUserList.findIndex((item) => item.id === user.id)
    if (index > -1) {
      mockUserList[index] = user
    }
    return Promise.resolve(user)
  }
  return http.put<User>('/user/update', user)
}
