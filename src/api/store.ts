/**
 * 店铺 / 分类 / 商品接口
 * 校园外卖（即shopType=2）和小卖部（shopType=3）共用接口，仅仅为传的类型参数不同。
 */
import { USE_MOCK } from '@/config'
import type { Goods, GoodsCategory, Shop, ShopType } from '@/types'
import { mockCategoryList, mockGoodsList, mockShopList } from './mock'
import { http } from './request'

/** 查询店铺列表：shopType 传 2 是校园外卖，传 3 是小卖部 */
export function getShopList(shopType: ShopType) {
  if (USE_MOCK) {
    return Promise.resolve(mockShopList.filter((shop) => shop.shopType === shopType))
  }
  return http.get<Shop[]>('/shop/list', { shopType })
}

/** 查询店铺详情 */
export function getShopById(id: number) {
  if (USE_MOCK) {
    return Promise.resolve(mockShopList.find((shop) => shop.id === id) || null)
  }
  return http.get<Shop | null>(`/shop/${id}`)
}

/** 查询某个店铺的商品分类 */
export function getCategoryList(shopId: number) {
  if (USE_MOCK) {
    return Promise.resolve(mockCategoryList.filter((item) => item.shopId === shopId))
  }
  return http.get<GoodsCategory[]>('/category/list', { shopId })
}

/** 查询商品列表，三个条件都可以不传 */
export function getGoodsList(params: { shopId?: number; categoryId?: number; keyword?: string }) {
  if (USE_MOCK) {
    return Promise.resolve(
      mockGoodsList.filter((goods) => {
        const matchShop = params.shopId ? goods.shopId === params.shopId : true
        const matchCategory = params.categoryId ? goods.categoryId === params.categoryId : true
        const matchKeyword = params.keyword ? goods.goodsName.includes(params.keyword) : true
        return matchShop && matchCategory && matchKeyword && goods.status === 1
      }),
    )
  }
  return http.get<Goods[]>('/goods/list', params)
}

/** 查询商品详情 */
export function getGoodsById(id: number) {
  if (USE_MOCK) {
    return Promise.resolve(mockGoodsList.find((goods) => goods.id === id) || null)
  }
  return http.get<Goods | null>(`/goods/${id}`)
}
