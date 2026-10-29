/**
 * 全局类型定义
 * 数据格式自己看吧...
 */

/** 用户角色：1 顾客  2 骑手  3 管理员 */
export type UserRole = 1 | 2 | 3

/** 订单类型：1 代取快递  2 校园外卖  3 小卖部送货上门 */
export type OrderType = 1 | 2 | 3

/** 订单状态：0 待支付  1 待接单  2 配送中  3 已完成  4 已取消 */
export type OrderStatus = 0 | 1 | 2 | 3 | 4

/** 店铺类型：2 校园外卖  3 小卖部（1 是平台自营，预留不用） */
export type ShopType = 2 | 3

/** 后端统一返回格式，所有接口都返回它：{ code, msg, data } */
export interface ApiResult<T> {
  code: number // 200 表示成功，其他表示失败
  msg: string // 提示文字
  data: T // 真正的数据
}

/** 用户表 user */
export interface User {
  id: number
  username: string // 登录名
  password?: string // 密码（示例项目不加密，只做演示）
  realName: string // 真实姓名
  nickname: string // 昵称
  phone: string
  avatar: string // 头像地址，可以为空字符串
  studentNo: string // 学号
  role: UserRole // 角色
  balance: number // 余额（示例用，不做真实支付）
  status: number // 1 正常  0 禁用
  createTime?: string
}

/** 收货地址表 address */
export interface Address {
  id: number
  userId: number
  contactName: string // 收货人
  phone: string
  building: string // 宿舍楼，例如“3号楼”
  room: string // 房间号，例如“302”
  detail: string // 补充说明，例如“放门口鞋柜上”
  isDefault: number // 1 默认地址  0 普通地址
  createTime?: string
}

/** 骑手表 rider（骑手也是 user，这里存放跑腿相关的额外信息） */
export interface Rider {
  id: number
  userId: number
  realName: string
  phone: string
  studentNo: string
  status: number // 0 休息中  1 可接单
  totalOrders: number // 累计完成单数
  creditScore: number // 信用分，示例项目固定 100
  createTime?: string
}

/** 店铺表 shop（校园外卖商家 + 小卖部共用一张表，用 shopType 区分） */
export interface Shop {
  id: number
  shopName: string
  shopType: ShopType
  logo: string
  phone: string
  address: string // 店铺位置，例如“一食堂二楼 12 号窗口”
  openTime: string // 营业开始时间，例如 "08:00"
  closeTime: string // 营业结束时间，例如 "21:30"
  minAmount: number // 起送价
  deliveryFee: number // 配送费
  notice: string // 店铺公告
  status: number // 1 营业中  0 休息
  sort: number // 排序，数字越小越靠前
}

/** 商品分类表 goods_category */
export interface GoodsCategory {
  id: number
  shopId: number // 0 表示平台通用分类
  name: string
  sort: number
  status: number
}

/** 商品表 goods */
export interface Goods {
  id: number
  shopId: number
  shopName?: string // 列表展示用，由后端联表返回，可以不填
  categoryId: number
  goodsName: string
  image: string
  price: number // 现价
  originalPrice: number // 原价，划线展示
  stock: number // 库存
  sales: number // 销量
  unit: string // 单位，例如“份”“瓶”
  description: string // 商品描述
  status: number // 1 上架  0 下架
  sort: number
}

/** 快递驿站表 express_station（代取快递的取件地点） */
export interface ExpressStation {
  id: number
  stationName: string
  address: string
  phone: string
  businessHours: string // 营业时间，例如 "08:00-20:00"
  status: number
}

/** 订单明细表 order_item（校园外卖 / 小卖部才有明细，代取快递没有） */
export interface OrderItem {
  id: number
  orderId: number
  goodsId: number
  goodsName: string // 下单时的商品名，防止商品改名后订单看不懂
  goodsImage: string
  price: number // 下单时的单价
  quantity: number
  amount: number // 小计 = price * quantity
}

/** 订单主表 orders（三种业务共用一张订单表，用 orderType 区分） */
export interface Order {
  id: number
  orderNo: string // 订单号，前端展示用
  orderType: OrderType
  userId: number
  riderId: number | null // 还没人接单时为 null
  shopId: number | null // 外卖 / 小卖部订单才有
  stationId: number | null // 代取快递订单才有
  // 收货信息（下单时从地址簿复制过来，之后改地址不影响老订单）
  receiverName: string
  receiverPhone: string
  receiverBuilding: string
  receiverRoom: string
  // 代取快递专用
  pickupCode: string // 取件码
  expressCompany: string // 快递公司，例如“菜鸟驿站”
  packageSize: number // 1 小件  2 中件  3 大件
  packageWeight: number // 重量（千克）
  // 金额
  goodsAmount: number // 商品金额
  deliveryFee: number // 配送费 / 跑腿费
  tip: number // 小费
  totalAmount: number // 合计
  remark: string // 备注
  expectTime: string // 期望送达时间
  status: OrderStatus
  payStatus: number // 0 未支付  1 已支付
  payTime: string | null
  acceptTime: string | null // 骑手接单时间
  finishTime: string | null
  cancelReason: string
  createTime: string
  updateTime?: string
  // 方便页面直接展示的冗余字段，由后端联表返回
  shopName?: string
  stationName?: string
  riderName?: string
  items?: OrderItem[] // 订单明细
}

/** 订单状态流水表 order_status_log（记录每一步是谁改的状态） */
export interface OrderStatusLog {
  id: number
  orderId: number
  status: OrderStatus
  operatorId: number
  operatorRole: number
  remark: string
  createTime: string
}

/** 购物车表 cart（返回时带上商品信息，方便页面直接显示） */
export interface CartItem {
  id: number
  userId: number
  shopId: number
  shopName?: string
  goodsId: number
  goodsName?: string
  goodsImage?: string
  price?: number
  quantity: number
}

/** 首页公告 / 轮播图表 announcement */
export interface Announcement {
  id: number
  title: string
  content: string
  image: string
  type: number // 1 公告  2 轮播图
  status: number // 1 已发布  0 已下架
  sort: number // 排序，小的在前
  createTime?: string // 创建时间，管理端列表显示用
}

/** 下单时提交给后端的数据 */
export interface OrderCreateForm {
  orderType: OrderType
  userId: number
  shopId?: number
  stationId?: number
  addressId?: number
  receiverName: string
  receiverPhone: string
  receiverBuilding: string
  receiverRoom: string
  pickupCode?: string
  expressCompany?: string
  packageSize?: number
  packageWeight?: number
  remark: string
  expectTime: string
  tip: number
  /** 配送费 / 跑腿费，前端传过来只是为了显示，后端应该自己再算一遍 */
  deliveryFee?: number
  // 外卖 / 小卖部：买了哪些商品
  items?: { goodsId: number; quantity: number }[]
}

/** 查询订单列表的条件 */
export interface OrderQuery {
  userId?: number
  riderId?: number
  status?: OrderStatus | '' // 空字符串表示“全部”
  orderType?: OrderType | ''
  pageNum?: number
  pageSize?: number
}

/** 管理端首页统计数据 */
export interface Statistics {
  todayOrderCount: number // 今日订单数
  todayAmount: number // 今日成交金额
  waitAcceptCount: number // 待接单数量
  finishCount: number // 已完成数量
  userCount: number // 用户总数
  riderCount: number // 骑手总数
}

/** 骑手端业绩统计（字段与后端 RiderStatisticsVO / docs/03 8.4 一致） */
export interface RiderStatistics {
  riderId?: number
  realName?: string
  status?: number
  todayOrders: number // 今日完成单数
  totalOrders: number // 累计完成单数
  todayAmount: number // 今日收入（配送费 + 小费）
  creditScore: number // 信用分
  doingOrders?: number // 当前配送中
}
