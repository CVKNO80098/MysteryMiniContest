/**
 * 购物车接口
 * 说明：同一个商品重复加购，后端应该把数量累加，而不是插入两条记录。
 */
import { USE_MOCK } from '@/config'
import type { CartItem } from '@/types'
import { mockCartList, mockGoodsList, mockShopList } from './mock'
import { http } from './request'

/** 查询购物车列表 */
export function getCartList(userId: number) {
  if (USE_MOCK) {
    return Promise.resolve(mockCartList.filter((item) => item.userId === userId))
  }
  return http.get<CartItem[]>('/cart/list', { userId })
}

/** 加入购物车 */
export function addToCart(userId: number, shopId: number, goodsId: number, quantity: number) {
  if (USE_MOCK) {
    const exist = mockCartList.find((item) => item.userId === userId && item.goodsId === goodsId)
    if (exist) {
      // 已经买过这个商品，只加数量
      exist.quantity += quantity
    } else {
      const goods = mockGoodsList.find((item) => item.id === goodsId)
      const shop = mockShopList.find((item) => item.id === shopId)
      mockCartList.push({
        id: Date.now(),
        userId,
        shopId,
        shopName: shop ? shop.shopName : '',
        goodsId,
        goodsName: goods ? goods.goodsName : '',
        goodsImage: goods ? goods.image : '',
        price: goods ? goods.price : 0,
        quantity,
      })
    }
    return Promise.resolve(mockCartList.filter((item) => item.userId === userId))
  }
  return http.post<CartItem[]>('/cart/add', { userId, shopId, goodsId, quantity })
}

/** 修改购物车中某个商品的数量 */
export function updateCartQuantity(id: number, quantity: number) {
  if (USE_MOCK) {
    const item = mockCartList.find((cart) => cart.id === id)
    if (item) {
      item.quantity = quantity
    }
    return Promise.resolve(true)
  }
  return http.put<boolean>('/cart/update', { id, quantity })
}

/** 从购物车删除一条 */
export function deleteCartItem(id: number) {
  if (USE_MOCK) {
    const index = mockCartList.findIndex((item) => item.id === id)
    if (index > -1) {
      mockCartList.splice(index, 1)
    }
    return Promise.resolve(true)
  }
  return http.delete<boolean>(`/cart/${id}`)
}

/** 清空某个用户的购物车（下单成功后调用） */
export function clearCart(userId: number) {
  if (USE_MOCK) {
    for (let i = mockCartList.length - 1; i >= 0; i--) {
      if (mockCartList[i].userId === userId) {
        mockCartList.splice(i, 1)
      }
    }
    return Promise.resolve(true)
  }
  return http.delete<boolean>('/cart/clear', { userId })
}
