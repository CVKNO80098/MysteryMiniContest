/**
 * 收货地址接口
 * 下单页会用到：选一个地址，自动带出宿舍楼和房间号。
 */
import { USE_MOCK } from '@/config'
import type { Address } from '@/types'
import { mockAddressList } from './mock'
import { http } from './request'

/** 查询某个用户的全部地址 */
export function getAddressList(userId: number) {
  if (USE_MOCK) {
    return Promise.resolve(mockAddressList.filter((item) => item.userId === userId))
  }
  return http.get<Address[]>('/address/list', { userId })
}

/** 新增地址 */
export function saveAddress(address: Address) {
  if (USE_MOCK) {
    const newAddress = { ...address, id: Date.now() }
    mockAddressList.push(newAddress)
    return Promise.resolve(newAddress)
  }
  return http.post<Address>('/address/save', address)
}

/** 修改地址 */
export function updateAddress(address: Address) {
  if (USE_MOCK) {
    const index = mockAddressList.findIndex((item) => item.id === address.id)
    if (index > -1) {
      mockAddressList[index] = address
    }
    return Promise.resolve(address)
  }
  return http.put<Address>('/address/update', address)
}

/** 删除地址 */
export function deleteAddress(id: number) {
  if (USE_MOCK) {
    const index = mockAddressList.findIndex((item) => item.id === id)
    if (index > -1) {
      mockAddressList.splice(index, 1)
    }
    return Promise.resolve(true)
  }
  return http.delete<boolean>(`/address/${id}`)
}

/** 把某个地址设为默认地址（请求体里带 userId，方便后端把其他地址取消默认） */
export function setDefaultAddress(id: number, userId: number) {
  if (USE_MOCK) {
    mockAddressList.forEach((item) => {
      if (item.userId === userId) {
        item.isDefault = item.id === id ? 1 : 0
      }
    })
    return Promise.resolve(true)
  }
  return http.put<boolean>(`/address/default/${id}`, { userId })
}
