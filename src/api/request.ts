/**
 * axios 统一封装，所有网络请求都从这走
 * 结构：创建实例 → 请求拦截器（打日志）→ 响应拦截器（拆 data、弹错误）→ 导出 http 四个方法
 *
 * 后端返回 { code: 200, msg: "ok", data: 真正的数据 }
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

// 请求拦截器：只做日志。本项目不做 JWT，不加 token，也没有后端拦截器，时间不够
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
    response.data = result.data
    return response
  },
  (error) => {
    ElMessage.error('网络异常，请检查后端是否已启动（默认 8080 端口）')
    return Promise.reject(error)
  },
)

/**
 * 对外的请求对象，页面里只用这四个方法
 * 拦截器已经把 { code, msg, data } 拆开塞进 response.data 了，这里再取一层，
 * 页面拿到的就是干净的 data（之前漏了这层 .then，拿到的是整个响应对象）
 */
export const http = {
  get<T>(url: string, params?: object): Promise<T> {
    return instance.get(url, { params }).then((response) => response.data as T)
  },
  post<T>(url: string, data?: object): Promise<T> {
    return instance.post(url, data).then((response) => response.data as T)
  },
  put<T>(url: string, data?: object): Promise<T> {
    return instance.put(url, data).then((response) => response.data as T)
  },
  delete<T>(url: string, params?: object): Promise<T> {
    return instance.delete(url, { params }).then((response) => response.data as T)
  },
}

export default instance
