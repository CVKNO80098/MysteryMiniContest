/**
 * 管理端接口
 * 只放管理端专用的（统计、商品 / 店铺 / 公告维护、封禁用户）。
 * 订单管理和用户列表分别复用 api/order.ts、api/user.ts 里已有的方法。
 */
import { USE_MOCK } from '@/config'
import type { Announcement, Goods, Shop, Statistics } from '@/types'
import { mockAnnouncementList, mockGoodsList, mockShopList, mockStatistics, mockUserList } from './mock'
import { http } from './request'

/** 首页统计数据 */
export function getStatistics() {
  if (USE_MOCK) {
    return Promise.resolve({ ...mockStatistics })
  }
  return http.get<Statistics>('/admin/statistics')
}

/** 新增商品 */
export function saveGoods(goods: Goods) {
  if (USE_MOCK) {
    const newGoods = { ...goods, id: Date.now() }
    mockGoodsList.push(newGoods)
    return Promise.resolve(newGoods)
  }
  return http.post<Goods>('/admin/goods/save', goods)
}

/** 修改商品（改价格、库存、上架下架） */
export function updateGoods(goods: Goods) {
  if (USE_MOCK) {
    const index = mockGoodsList.findIndex((item) => item.id === goods.id)
    if (index > -1) {
      mockGoodsList[index] = goods
    }
    return Promise.resolve(goods)
  }
  return http.put<Goods>('/admin/goods/update', goods)
}

/** 删除商品 */
export function deleteGoods(id: number) {
  if (USE_MOCK) {
    const index = mockGoodsList.findIndex((item) => item.id === id)
    if (index > -1) {
      mockGoodsList.splice(index, 1)
    }
    return Promise.resolve(true)
  }
  return http.delete<boolean>(`/admin/goods/${id}`)
}

/** 新增店铺 */
export function saveShop(shop: Shop) {
  if (USE_MOCK) {
    const newShop = { ...shop, id: Date.now() }
    mockShopList.push(newShop)
    return Promise.resolve(newShop)
  }
  return http.post<Shop>('/admin/shop/save', shop)
}

/** 修改店铺（营业状态、配送费、公告） */
export function updateShop(shop: Shop) {
  if (USE_MOCK) {
    const index = mockShopList.findIndex((item) => item.id === shop.id)
    if (index > -1) {
      mockShopList[index] = shop
    }
    return Promise.resolve(shop)
  }
  return http.put<Shop>('/admin/shop/update', shop)
}

/** 启用 / 禁用用户：status 传 1 启用，0 禁用 */
export function updateUserStatus(userId: number, status: number) {
  if (USE_MOCK) {
    const user = mockUserList.find((item) => item.id === userId)
    if (user) {
      user.status = status
    }
    return Promise.resolve(true)
  }
  return http.put<boolean>('/admin/user/status', { userId, status })
}

/** 新增公告 */
export function saveAnnouncement(announcement: Announcement) {
  if (USE_MOCK) {
    const newItem = { ...announcement, id: Date.now() }
    mockAnnouncementList.push(newItem)
    return Promise.resolve(newItem)
  }
  return http.post<Announcement>('/admin/announcement/save', announcement)
}

/** 修改公告（改标题内容、发布下架） */
export function updateAnnouncement(announcement: Announcement) {
  if (USE_MOCK) {
    const index = mockAnnouncementList.findIndex((item) => item.id === announcement.id)
    if (index > -1) {
      mockAnnouncementList[index] = announcement
    }
    return Promise.resolve(announcement)
  }
  return http.put<Announcement>('/admin/announcement/update', announcement)
}

/** 删除公告 */
export function deleteAnnouncement(id: number) {
  if (USE_MOCK) {
    const index = mockAnnouncementList.findIndex((item) => item.id === id)
    if (index > -1) {
      mockAnnouncementList.splice(index, 1)
    }
    return Promise.resolve(true)
  }
  return http.delete<boolean>(`/admin/announcement/${id}`)
}
