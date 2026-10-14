/**
 * 骑手接口
 * 骑手端两个页面：接单大厅（查待接单订单）、我的跑腿（查自己接的订单）
 * 慢步~
 */
import { USE_MOCK } from '@/config'
import type { Order, Rider, RiderStatistics } from '@/types'
import { mockOrderList, mockRiderList } from './mock'
import { http } from './request'

/** 接单大厅：查询所有“待接单”的订单 */
export function getRiderHall() {
  if (USE_MOCK) {
    return Promise.resolve(mockOrderList.filter((order) => order.status === 1))
  }
  return http.get<Order[]>('/rider/hall')
}

/** 根据用户 id 查询骑手信息（骑手也是 user，用 userId 找） */
export function getRiderInfo(userId: number) {
  if (USE_MOCK) {
    return Promise.resolve(mockRiderList.find((rider) => rider.userId === userId) || null)
  }
  return http.get<Rider | null>('/rider/info', { userId })
}

/** 切换接单状态：1 可接单，0 休息中 */
export function updateRiderStatus(riderId: number, status: number) {
  if (USE_MOCK) {
    const rider = mockRiderList.find((item) => item.id === riderId)
    if (rider) {
      rider.status = status
    }
    return Promise.resolve(rider || null)
  }
  return http.put<Rider | null>('/rider/status', { riderId, status })
}

/** 骑手业绩统计 */
export function getRiderStatistics(riderId: number) {
  if (USE_MOCK) {
    const rider = mockRiderList.find((item) => item.id === riderId)
    const list = mockOrderList.filter((order) => order.riderId === riderId)
    return Promise.resolve<RiderStatistics>({
      todayOrderCount: list.filter((order) => order.status === 3).length,
      totalOrderCount: rider ? rider.totalOrders : 0,
      todayAmount: list.reduce((sum, order) => sum + order.totalAmount, 0),
      creditScore: rider ? rider.creditScore : 100,
    })
  }
  return http.get<RiderStatistics>('/rider/statistics', { riderId })
}
