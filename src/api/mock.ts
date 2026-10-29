/**
 * 假数据（mock）
 *
 * 什么时候用：后端还没写好，或者想让页面直接能点开看效果时。
 * 把 .env.development 里的 VITE_USE_MOCK 改成 false，然后重启 npm run dev 即可取消使用...但是现在是必须的
 *
 * 重要：这里的演示数据尽量和 sql/campus_errand.sql 对齐（id、名称、价格基本一致），
 *      统计数字是演示值，真实数据由后端算；字段以 src/types/index.ts 为准。
 *      关掉 mock 连上后端后，页面看起来几乎没变，方便对比排查问题。
 *      对接完成后，这个文件可以整份删掉，接口文件里的 if (USE_MOCK) 分支也一起删。
 */
import type {
  Address,
  Announcement,
  CartItem,
  ExpressStation,
  Goods,
  GoodsCategory,
  Order,
  Rider,
  Shop,
  Statistics,
  User,
} from '@/types'

/* ---------------- 用户（对应 user 表） ---------------- */

export const mockUserList: User[] = [
  {
    id: 1,
    username: 'xiaoming',
    password: '123456',
    realName: '张小明',
    nickname: '小明',
    phone: '13800000001',
    avatar: '',
    studentNo: '2021010101',
    role: 1,
    balance: 100,
    status: 1,
    createTime: '2024-05-01 09:00:00',
  },
  {
    id: 2,
    username: 'dali',
    password: '123456',
    realName: '李大力',
    nickname: '大力',
    phone: '13800000002',
    avatar: '',
    studentNo: '2021010102',
    role: 2,
    balance: 200,
    status: 1,
    createTime: '2024-05-01 09:10:00',
  },
  {
    id: 3,
    username: 'wanglaoshi',
    password: '123456',
    realName: '王老师',
    nickname: '王老师',
    phone: '13800000003',
    avatar: '',
    studentNo: 'T2021001',
    role: 3,
    balance: 0,
    status: 1,
    createTime: '2024-05-01 09:20:00',
  },
]

/* ---------------- 收货地址（对应 address 表） ---------------- */

export const mockAddressList: Address[] = [
  {
    id: 1,
    userId: 1,
    contactName: '张小明',
    phone: '13800000001',
    building: '3号楼',
    room: '305',
    detail: '3号楼下快递柜旁边那栋',
    isDefault: 1,
    createTime: '2024-05-02 10:00:00',
  },
  {
    id: 2,
    userId: 1,
    contactName: '张小明',
    phone: '13800000001',
    building: '1号楼',
    room: '512',
    detail: '一食堂后面那栋',
    isDefault: 0,
    createTime: '2024-05-02 10:05:00',
  },
]

/* ---------------- 骑手（对应 rider 表） ---------------- */

export const mockRiderList: Rider[] = [
  {
    id: 1,
    userId: 2,
    realName: '李大力',
    phone: '13800000002',
    studentNo: '2021010102',
    status: 1,
    totalOrders: 26,
    creditScore: 98,
    createTime: '2024-05-01 09:10:00',
  },
]

/* ---------------- 店铺（对应 shop 表） ---------------- */

export const mockShopList: Shop[] = [
  {
    id: 1,
    shopName: '一食堂·兰州拉面',
    shopType: 2,
    logo: '',
    phone: '13800001001',
    address: '第一食堂一楼 08 号窗口',
    openTime: '07:00',
    closeTime: '21:00',
    minAmount: 15,
    deliveryFee: 2,
    notice: '现拉现煮，高峰期请耐心等待',
    status: 1,
    sort: 1,
  },
  {
    id: 2,
    shopName: '二食堂·黄焖鸡米饭',
    shopType: 2,
    logo: '',
    phone: '13800001002',
    address: '第二食堂二楼 12 号窗口',
    openTime: '10:00',
    closeTime: '20:30',
    minAmount: 16,
    deliveryFee: 2,
    notice: '米饭免费加，汤免费',
    status: 1,
    sort: 2,
  },
  {
    id: 3,
    shopName: '3号楼下便利店',
    shopType: 3,
    logo: '',
    phone: '13800001003',
    address: '3号楼一楼架空层',
    openTime: '07:00',
    closeTime: '23:30',
    minAmount: 10,
    deliveryFee: 3,
    notice: '24 小时可下单，9 点前送到',
    status: 1,
    sort: 3,
  },
  {
    id: 4,
    shopName: '校园超市零食铺',
    shopType: 3,
    logo: '',
    phone: '13800001004',
    address: '校园超市进门右手边',
    openTime: '08:30',
    closeTime: '22:00',
    minAmount: 12,
    deliveryFee: 3,
    notice: '满 20 元减 2 元',
    status: 1,
    sort: 4,
  },
]

/* ---------------- 商品分类（对应 goods_category 表） ---------------- */

export const mockCategoryList: GoodsCategory[] = [
  { id: 1, shopId: 1, name: '招牌拉面', sort: 1, status: 1 },
  { id: 2, shopId: 1, name: '小吃凉菜', sort: 2, status: 1 },
  { id: 3, shopId: 2, name: '黄焖鸡系列', sort: 1, status: 1 },
  { id: 4, shopId: 2, name: '配菜饮料', sort: 2, status: 1 },
  { id: 5, shopId: 3, name: '饮料水', sort: 1, status: 1 },
  { id: 6, shopId: 3, name: '零食', sort: 2, status: 1 },
  { id: 7, shopId: 3, name: '生活用品', sort: 3, status: 1 },
  { id: 8, shopId: 4, name: '零食膨化', sort: 1, status: 1 },
  { id: 9, shopId: 4, name: '方便速食', sort: 2, status: 1 },
]

/* ---------------- 商品（对应 goods 表，共 12 条） ---------------- */

export const mockGoodsList: Goods[] = [
  { id: 1, shopId: 1, categoryId: 1, goodsName: '兰州牛肉拉面', image: '', price: 15, originalPrice: 18, stock: 100, sales: 320, unit: '份', description: '招牌，牛肉片加萝卜加香菜', status: 1, sort: 1 },
  { id: 2, shopId: 1, categoryId: 1, goodsName: '加辣牛肉拉面', image: '', price: 17, originalPrice: 20, stock: 80, sales: 156, unit: '份', description: '多加一勺辣椒油，能吃辣的选', status: 1, sort: 2 },
  { id: 3, shopId: 1, categoryId: 2, goodsName: '卤鸡蛋', image: '', price: 2.5, originalPrice: 3, stock: 200, sales: 480, unit: '个', description: '拉面好搭档', status: 1, sort: 3 },
  { id: 4, shopId: 2, categoryId: 3, goodsName: '黄焖鸡米饭（小份）', image: '', price: 16, originalPrice: 18, stock: 120, sales: 265, unit: '份', description: '小份装，一个女生刚好吃完', status: 1, sort: 1 },
  { id: 5, shopId: 2, categoryId: 3, goodsName: '黄焖鸡米饭（大份）', image: '', price: 20, originalPrice: 23, stock: 90, sales: 143, unit: '份', description: '大份装，米饭可以免费加', status: 1, sort: 2 },
  { id: 6, shopId: 2, categoryId: 4, goodsName: '土豆片', image: '', price: 4, originalPrice: 5, stock: 150, sales: 88, unit: '份', description: '黄焖鸡里那种软土豆片', status: 1, sort: 3 },
  { id: 7, shopId: 2, categoryId: 4, goodsName: '冰红茶', image: '', price: 3.5, originalPrice: 4, stock: 300, sales: 210, unit: '瓶', description: '500ml，冰镇更好喝', status: 1, sort: 4 },
  { id: 8, shopId: 3, categoryId: 5, goodsName: '农夫山泉550ml', image: '', price: 2, originalPrice: 2.5, stock: 500, sales: 660, unit: '瓶', description: '宿舍常备', status: 1, sort: 1 },
  { id: 9, shopId: 3, categoryId: 6, goodsName: '乐事薯片（原味）', image: '', price: 6.5, originalPrice: 7.5, stock: 100, sales: 175, unit: '袋', description: '看剧必备', status: 1, sort: 2 },
  { id: 10, shopId: 3, categoryId: 7, goodsName: '心相印抽纸', image: '', price: 5, originalPrice: 6.5, stock: 120, sales: 96, unit: '包', description: '3 层 100 抽', status: 1, sort: 3 },
  { id: 11, shopId: 4, categoryId: 8, goodsName: '可比克薯片', image: '', price: 5.5, originalPrice: 6, stock: 80, sales: 60, unit: '袋', description: '番茄味，大袋装', status: 1, sort: 1 },
  { id: 12, shopId: 4, categoryId: 9, goodsName: '康师傅红烧牛肉面', image: '', price: 4.5, originalPrice: 5, stock: 200, sales: 330, unit: '桶', description: '桶装，宿舍泡着方便', status: 1, sort: 2 },
]

/* ---------------- 快递驿站（对应 express_station 表） ---------------- */

export const mockStationList: ExpressStation[] = [
  { id: 1, stationName: '菜鸟驿站3号楼店', address: '3号楼一楼架空层东侧', phone: '0571-88880001', businessHours: '08:00-20:00', status: 1 },
  { id: 2, stationName: '京东快递服务站', address: '学校东门快递服务中心', phone: '0571-88880002', businessHours: '09:00-19:00', status: 1 },
  { id: 3, stationName: '邮政快递代收点', address: '学校西门邮政服务点', phone: '0571-88880003', businessHours: '08:30-18:00', status: 1 },
]

/* ---------------- 购物车（对应 cart 表） ---------------- */

/** 购物车用普通数组存，加购 / 删除直接改这个数组，模拟后端数据库 */
export const mockCartList: CartItem[] = [
  { id: 1, userId: 1, shopId: 3, shopName: '3号楼下便利店', goodsId: 8, goodsName: '农夫山泉550ml', goodsImage: '', price: 2, quantity: 3 },
  { id: 2, userId: 1, shopId: 3, shopName: '3号楼下便利店', goodsId: 9, goodsName: '乐事薯片（原味）', goodsImage: '', price: 6.5, quantity: 1 },
  { id: 3, userId: 1, shopId: 3, shopName: '3号楼下便利店', goodsId: 10, goodsName: '心相印抽纸', goodsImage: '', price: 5, quantity: 1 },
]

/* ---------------- 订单（对应 orders + order_item 表，共 4 条） ---------------- */

export const mockOrderList: Order[] = [
  {
    id: 1,
    orderNo: 'CE202405200001',
    orderType: 1,
    userId: 1,
    riderId: null,
    shopId: null,
    stationId: 1,
    receiverName: '张小明',
    receiverPhone: '13800000001',
    receiverBuilding: '3号楼',
    receiverRoom: '305',
    pickupCode: '8-2-3051',
    expressCompany: '中通快递',
    packageSize: 2,
    packageWeight: 2.5,
    goodsAmount: 0,
    deliveryFee: 3,
    tip: 1,
    totalAmount: 4,
    remark: '有点重，麻烦送到宿舍门口',
    expectTime: '2024-05-20 18:00:00',
    status: 1,
    payStatus: 1,
    payTime: '2024-05-20 12:05:00',
    acceptTime: null,
    finishTime: null,
    cancelReason: '',
    createTime: '2024-05-20 12:05:00',
    stationName: '菜鸟驿站3号楼店',
  },
  {
    id: 2,
    orderNo: 'CE202405200002',
    orderType: 2,
    userId: 1,
    riderId: 1,
    shopId: 1,
    stationId: null,
    receiverName: '张小明',
    receiverPhone: '13800000001',
    receiverBuilding: '3号楼',
    receiverRoom: '305',
    pickupCode: '',
    expressCompany: '',
    packageSize: 0,
    packageWeight: 0,
    goodsAmount: 20,
    deliveryFee: 2,
    tip: 0,
    totalAmount: 22,
    remark: '拉面多加辣，鸡蛋单独装',
    expectTime: '2024-05-20 12:40:00',
    status: 2,
    payStatus: 1,
    payTime: '2024-05-20 12:10:00',
    acceptTime: '2024-05-20 12:15:00',
    finishTime: null,
    cancelReason: '',
    createTime: '2024-05-20 12:10:00',
    shopName: '一食堂·兰州拉面',
    riderName: '李大力',
    items: [
      { id: 1, orderId: 2, goodsId: 1, goodsName: '兰州牛肉拉面', goodsImage: '', price: 15, quantity: 1, amount: 15 },
      { id: 2, orderId: 2, goodsId: 3, goodsName: '卤鸡蛋', goodsImage: '', price: 2.5, quantity: 2, amount: 5 },
    ],
  },
  {
    id: 3,
    orderNo: 'CE202405200003',
    orderType: 3,
    userId: 1,
    riderId: 1,
    shopId: 3,
    stationId: null,
    receiverName: '张小明',
    receiverPhone: '13800000001',
    receiverBuilding: '1号楼',
    receiverRoom: '512',
    pickupCode: '',
    expressCompany: '',
    packageSize: 0,
    packageWeight: 0,
    goodsAmount: 15.5,
    deliveryFee: 3,
    tip: 0,
    totalAmount: 18.5,
    remark: '放宿舍门口就行，不用敲门',
    expectTime: '2024-05-19 21:00:00',
    status: 3,
    payStatus: 1,
    payTime: '2024-05-19 20:20:00',
    acceptTime: '2024-05-19 20:22:00',
    finishTime: '2024-05-19 20:45:00',
    cancelReason: '',
    createTime: '2024-05-19 20:20:00',
    shopName: '3号楼下便利店',
    riderName: '李大力',
    items: [
      { id: 3, orderId: 3, goodsId: 8, goodsName: '农夫山泉550ml', goodsImage: '', price: 2, quantity: 2, amount: 4 },
      { id: 4, orderId: 3, goodsId: 9, goodsName: '乐事薯片（原味）', goodsImage: '', price: 6.5, quantity: 1, amount: 6.5 },
      { id: 5, orderId: 3, goodsId: 10, goodsName: '心相印抽纸', goodsImage: '', price: 5, quantity: 1, amount: 5 },
    ],
  },
  {
    id: 4,
    orderNo: 'CE202405200004',
    orderType: 1,
    userId: 1,
    riderId: null,
    shopId: null,
    stationId: 2,
    receiverName: '张小明',
    receiverPhone: '13800000001',
    receiverBuilding: '3号楼',
    receiverRoom: '305',
    pickupCode: 'JD-0098',
    expressCompany: '京东快递',
    packageSize: 1,
    packageWeight: 0.8,
    goodsAmount: 0,
    deliveryFee: 2,
    tip: 0.5,
    totalAmount: 2.5,
    remark: '小件，下午四点以后送',
    expectTime: '2024-05-20 16:00:00',
    status: 1,
    payStatus: 1,
    payTime: '2024-05-20 13:00:00',
    acceptTime: null,
    finishTime: null,
    cancelReason: '',
    createTime: '2024-05-20 13:00:00',
    stationName: '京东快递服务站',
  },
]

/* ---------------- 公告与轮播图（对应 announcement 表） ---------------- */

export const mockAnnouncementList: Announcement[] = [
  {
    id: 1,
    title: '校园代跑腿平台上线啦',
    content: '代取快递、食堂外卖、小卖部送货都能下单，首单免配送费。',
    image: '',
    type: 1,
    status: 1,
    sort: 1,
  },
  {
    id: 2,
    title: '新用户立减 2 元',
    content: '活动时间：本月 1 号到 30 号，下单自动抵扣。',
    image: '',
    type: 2,
    status: 1,
    sort: 2,
  },
]

/* ---------------- 管理端统计（临时演示数字，真实数据由后端算） ---------------- */

export const mockStatistics: Statistics = {
  todayOrderCount: 4,
  todayAmount: 40.5,
  waitAcceptCount: 2,
  finishCount: 1,
  userCount: 3,
  riderCount: 1,
}
