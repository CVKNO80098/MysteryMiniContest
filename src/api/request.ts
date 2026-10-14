/**
 * axios 统一封装（所有网络请求都从这里出去）
 *
 * 后端返回格式固定为：{ code: 200, msg: "ok", data: 真正的数据 }
 * 这里做两件事：
 *   1. 请求前：打印一行日志，方便学生看“到底请求了哪个接口”
 *   2. 响应后：把 data 拆出来直接给页面用；失败统一弹提示
 *
 * 暂时没做登录验证...毕竟是个示例项目，时间也不是很充裕，先这样吧
 *
 * 页面里的用法：http.get<Goods[]>('/goods/list', { shopId: 1 })
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { API_BASE_URL } from '@/config'
import type { ApiResult } from '@/types'

// 创建 axios 实例，统一超时时间 10 秒
const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// 请求拦截器：只做日志。本项目不做 JWT，不加 token，也没有后端拦截器
instance.interceptors.request.use((config) => {
  console.log('[请求]', config.method?.toUpperCase(), config.url, config.params || config.data || '')
  return config
})

// 响应拦截器：统一处理返回结果
instance.interceptors.response.use(
  (response) => {
    const result = response.data as ApiResult<unknown>
    // 后端没按约定返回 code，直接放行，避免学生少写一个字段就全站报错
    if (result.code === undefined) {
      return response
    }
    if (result.code !== 200) {
      ElMessage.error(result.msg || '请求失败')
      return Promise.reject(new Error(result.msg || '请求失败'))
    }
    // 把 data 拆出来，页面拿到的就是干净的业务数据
    response.data = result.data
    return response
  },
  (error) => {
    ElMessage.error('网络异常，请检查后端是否已启动（默认 8080 端口）')
    return Promise.reject(error)
  },
)

/**
 * 对外的请求对象。
 * 页面里只用 http.get / http.post / http.put / http.delete 这四个方法。
 */
export const http = {
  get<T>(url: string, params?: object): Promise<T> {
    return instance.get(url, { params }) as unknown as Promise<T>
  },
  post<T>(url: string, data?: object): Promise<T> {
    return instance.post(url, data) as unknown as Promise<T>
  },
  put<T>(url: string, data?: object): Promise<T> {
    return instance.put(url, data) as unknown as Promise<T>
  },
  delete<T>(url: string, params?: object): Promise<T> {
    return instance.delete(url, { params }) as unknown as Promise<T>
  },
}

export default instance
