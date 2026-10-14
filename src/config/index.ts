/**
 * 项目配置
 * 因为很多配置在现在测试的时候是要一直变动的，统一提取出来吧
 * 也方便修改了...没想到项目会写这么大...后端也够我写的了
 */

/** 后端接口前缀；开发环境用 /api，由 vite 代理转发到 http://localhost:8080 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * 是否使用假数据（mock）
 * true ：后端还没写好，页面用 src/api/mock.ts 里的假数据，能正常点开看效果
 * false：真的去请求 SpringBoot
 * 改完记得重启 npm run dev
 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 列表默认分页大小 */
export const DEFAULT_PAGE_SIZE = 10

/** 订单号前缀，前端只在 mock 里用得到 */
export const ORDER_NO_PREFIX = 'CD'
