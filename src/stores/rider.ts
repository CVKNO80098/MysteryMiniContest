/**
 * 骑手状态
 * 接单大厅和我的跑腿都要用骑手信息，放这里共享，一处改了另一处也能看到
 */
import { defineStore } from 'pinia'
import { acceptOrder, getOrderList } from '@/api/order'
import { getRiderInfo, getRiderStatistics, updateRiderStatus } from '@/api/rider'
import type { Order, Rider, RiderStatistics } from '@/types'
import { useUserStore } from './user'

export const useRiderStore = defineStore('rider', {
  state: () => ({
    rider: null as Rider | null, // 当前账号的骑手信息，不是骑手就是 null
    statistics: null as RiderStatistics | null, // 业绩统计
    hallList: [] as Order[], // 待接单的订单
  }),

  getters: {
    // 接单状态：1 可接单 0 休息中，页面上的开关直接读它
    status(state): number {
      return state.rider ? state.rider.status : 0
    },
    isRider(state): boolean {
      return state.rider !== null
    },
  },

  actions: {
    // 进页面时调一次：骑手信息 + 统计 + 大厅
    async loadAll() {
      const userStore = useUserStore()

      this.rider = await getRiderInfo(userStore.userId)
      this.statistics = this.rider ? await getRiderStatistics(this.rider.id) : null
      this.hallList = await getOrderList({ status: 1 })
    },

    // 切接单状态：先改 state 让界面马上动，再发请求，失败了改回去
    async changeStatus(status: number) {
      if (!this.rider) {
        return
      }

      const oldStatus = this.rider.status
      this.rider.status = status

      try {
        const result = await updateRiderStatus(this.rider.id, status)
        if (!result) {
          throw new Error('没查到骑手信息')
        }
        this.rider = result // 以后端返回的为准
      } catch (error) {
        this.rider.status = oldStatus // 回滚
        throw error // 让页面去弹提示
      }
    },

    // 抢单，抢完重新拉一次大厅
    async accept(order: Order) {
      if (!this.rider) {
        return
      }
      await acceptOrder(order.id, this.rider.id)
      this.hallList = await getOrderList({ status: 1 })
    },
  },
})
