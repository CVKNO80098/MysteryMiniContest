/**
 * 代取快递相关接口
 * 目前只有“查快递驿站”，下单统一走 src/api/order.ts 的 createOrder。
 */
import { USE_MOCK } from '@/config'
import type { ExpressStation } from '@/types'
import { mockStationList } from './mock'
import { http } from './request'

/** 查询可代取的快递驿站列表 */
export function getStationList() {
  if (USE_MOCK) {
    return Promise.resolve(mockStationList.filter((station) => station.status === 1))
  }
  return http.get<ExpressStation[]>('/station/list')
}
