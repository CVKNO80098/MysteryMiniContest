/**
 * 订单接口（三种业务共用）
 * 后端只需要一个 OrderController，用 orderType 区分是快递、外卖还是小卖部。
 */
import { USE_MOCK } from '@/config'
import type { Order, OrderCreateForm, OrderItem, OrderQuery } from '@/types'
import { createOrderNo, nowText } from '@/utils/format'
import { mockGoodsList, mockOrderList, mockShopList, mockStationList } from './mock'
import { http } from './request'

/** 下单：把订单信息提交给后端，后端生成订单号并返回完整订单 */
export function createOrder(form: OrderCreateForm) {
  if (USE_MOCK) {
    const orderId = Date.now()
    const deliveryFee = form.deliveryFee || 0
    const shop = mockShopList.find((item) => item.id === form.shopId)
    const station = mockStationList.find((item) => item.id === form.stationId)

    // 把“买了哪些商品”换成订单明细，方便订单详情页显示
    const items: OrderItem[] = (form.items || []).map((item, index) => {
      const goods = mockGoodsList.find((goods) => goods.id === item.goodsId)
      const price = goods ? goods.price : 0
      return {
        id: index + 1,
        orderId,
        goodsId: item.goodsId,
        goodsName: goods ? goods.goodsName : '',
        goodsImage: goods ? goods.image : '',
        price,
        quantity: item.quantity,
        amount: price * item.quantity,
      }
    })
    const goodsAmount = items.reduce((sum, item) => sum + item.amount, 0)

    const order: Order = {
      id: orderId,
      orderNo: createOrderNo(),
      orderType: form.orderType,
      userId: form.userId,
      riderId: null,
      shopId: form.shopId || null,
      stationId: form.stationId || null,
      receiverName: form.receiverName,
      receiverPhone: form.receiverPhone,
      receiverBuilding: form.receiverBuilding,
      receiverRoom: form.receiverRoom,
      pickupCode: form.pickupCode || '',
      expressCompany: form.expressCompany || '',
      packageSize: form.packageSize || 0,
      packageWeight: form.packageWeight || 0,
      goodsAmount,
      deliveryFee,
      tip: form.tip,
      totalAmount: goodsAmount + deliveryFee + form.tip,
      remark: form.remark,
      expectTime: form.expectTime,
      status: 1, // 新订单默认“待接单”
      payStatus: 1,
      payTime: nowText(),
      acceptTime: null,
      finishTime: null,
      cancelReason: '',
      createTime: nowText(),
      shopName: shop ? shop.shopName : '',
      stationName: station ? station.stationName : '',
      items,
    }
    mockOrderList.unshift(order)
    return Promise.resolve(order)
  }
  return http.post<Order>('/order/create', form)
}

/** 查询订单列表，条件都不传就是查全部（管理端用） */
export function getOrderList(query: OrderQuery) {
  if (USE_MOCK) {
    let list = [...mockOrderList]
    if (query.userId) {
      list = list.filter((order) => order.userId === query.userId)
    }
    if (query.riderId) {
      list = list.filter((order) => order.riderId === query.riderId)
    }
    if (query.status !== undefined && query.status !== '') {
      const status = query.status
      list = list.filter((order) => order.status === status)
    }
    if (query.orderType) {
      const orderType = query.orderType
      list = list.filter((order) => order.orderType === orderType)
    }
    // 按下单时间倒序，最新的排前面
    return Promise.resolve(list.sort((a, b) => b.createTime.localeCompare(a.createTime)))
  }
  return http.get<Order[]>('/order/list', query)
}

/** 查询订单详情（带商品明细） */
export function getOrderDetail(id: number) {
  if (USE_MOCK) {
    return Promise.resolve(mockOrderList.find((order) => order.id === id) || null)
  }
  return http.get<Order | null>(`/order/${id}`)
}

/** 查询订单的商品明细 */
export function getOrderItems(orderId: number) {
  if (USE_MOCK) {
    const order = mockOrderList.find((item) => item.id === orderId)
    return Promise.resolve<OrderItem[]>(order && order.items ? order.items : [])
  }
  return http.get<OrderItem[]>(`/order/items/${orderId}`)
}

/** 骑手接单：接单后订单状态变成“配送中” */
export function acceptOrder(id: number, riderId: number) {
  if (USE_MOCK) {
    const order = mockOrderList.find((item) => item.id === id)
    if (order) {
      order.riderId = riderId
      order.status = 2
      order.acceptTime = nowText()
    }
    return Promise.resolve(order || null)
  }
  return http.post<Order | null>(`/order/${id}/accept`, { riderId })
}

/** 修改订单状态：骑手点“已送达”时调用 */
export function updateOrderStatus(id: number, status: number, remark: string) {
  if (USE_MOCK) {
    const order = mockOrderList.find((item) => item.id === id)
    if (order) {
      order.status = status as Order['status']
      if (status === 3) {
        order.finishTime = nowText()
      }
    }
    return Promise.resolve(order || null)
  }
  return http.post<Order | null>(`/order/${id}/status`, { status, remark })
}

/** 取消订单 */
export function cancelOrder(id: number, reason: string) {
  if (USE_MOCK) {
    const order = mockOrderList.find((item) => item.id === id)
    if (order) {
      order.status = 4
      order.cancelReason = reason
    }
    return Promise.resolve(order || null)
  }
  return http.post<Order | null>(`/order/${id}/cancel`, { reason })
}
