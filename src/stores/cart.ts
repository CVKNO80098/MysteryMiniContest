/**
 * 购物车状态（Pinia）
 * 数据来自后端接口，页面只操作这里的方法，不直接改数组。
 */
import { defineStore } from 'pinia'
import { addToCart, clearCart, deleteCartItem, getCartList, updateCartQuantity } from '@/api/cart'
import type { CartItem } from '@/types'
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartList: [] as CartItem[],
  }),

  getters: {
    /** 购物车里的商品总件数，顶部导航的角标用它 */
    totalCount(state): number {
      return state.cartList.reduce((sum, item) => sum + item.quantity, 0)
    },
    /** 商品金额合计（不含配送费） */
    totalAmount(state): number {
      return state.cartList.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
    },
    /** 购物车当前属于哪家店铺，空车时是 0 */
    shopId(state): number {
      return state.cartList.length > 0 ? state.cartList[0].shopId : 0
    },
  },

  actions: {
    /** 查询购物车（进入店铺页、购物车页时调用）；没登录就直接清空，不发请求 */
    async loadCart() {
      const userStore = useUserStore()
      if (!userStore.userId) {
        this.cartList = []
        return
      }
      this.cartList = await getCartList(userStore.userId)
    },

    /** 加入购物车 */
    async add(shopId: number, goodsId: number, quantity = 1) {
      const userStore = useUserStore()
      if (!userStore.userId) {
        return
      }
      this.cartList = await addToCart(userStore.userId, shopId, goodsId, quantity)
    },

    /** 修改数量 */
    async changeQuantity(id: number, quantity: number) {
      await updateCartQuantity(id, quantity)
      await this.loadCart()
    },

    /** 删除一个商品 */
    async remove(id: number) {
      await deleteCartItem(id)
      await this.loadCart()
    },

    /** 清空购物车（下单成功后调用） */
    async clear() {
      const userStore = useUserStore()
      await clearCart(userStore.userId)
      await this.loadCart()
    },

    /** 只清掉页面上的购物车（退出登录时用，不发请求） */
    reset() {
      this.cartList = []
    },
  },
})
