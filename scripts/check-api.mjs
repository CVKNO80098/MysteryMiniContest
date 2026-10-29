/**
 * 后端接口自检脚本
 *
 * 作用：后端（SpringBoot，8080）启动之后，跑一下这个脚本，
 *      它会用**和前端完全相同的请求**去访问每一个接口，逐条告诉你通没通、字段对不对。
 *
 * 用法：
 *   npm run check:api                     检查默认地址 http://localhost:8080/api
 *   npm run check:api http://192.168.1.5:8080/api    换一个后端地址
 *
 * 安全说明：默认**只检查查询类接口**，不会往数据库里插数据、改数据、删数据。
 *          下单、接单、改状态这些会动数据的接口列在最后，需要自己用页面点一遍。
 *
 * 看不懂报错时的排查顺序：
 *   404  → 路径写错了（Controller 上少了 /api？方法没写对 GET/POST？）
 *   500  → 后端报错了，去 IDEA 控制台看异常堆栈
 *   连接失败 → 后端没启动，或者端口不是 8080
 *   code 是 "200" 字符串 → 前端判断的是数字 200，会认为失败，改成数字
 *   data 缺少字段 → 实体类字段名和前端不一致（数据库下划线、Java 驼峰要开启映射）
 */
const BASE_URL = process.argv[2] || process.env.API_BASE || 'http://localhost:8080/api'

/**
 * 要检查的接口清单
 * path 里可以直接写查询参数；fields 是这个接口返回的第一条数据里必须有的字段名
 */
const checks = [
  // ---------- 用户 ----------
  { name: '用户列表', method: 'GET', path: '/user/list', fields: ['id', 'username', 'role', 'status'] },
  { name: '用户详情', method: 'GET', path: '/user/1', fields: ['id', 'username', 'realName'] },
  {
    name: '登录',
    method: 'POST',
    path: '/user/login',
    body: { username: 'xiaoming', password: '123456' },
    fields: ['id', 'role', 'realName'],
  },

  // ---------- 地址 ----------
  { name: '地址列表', method: 'GET', path: '/address/list?userId=1', fields: ['id', 'userId', 'building', 'room', 'isDefault'] },

  // ---------- 店铺与商品 ----------
  { name: '店铺列表（外卖）', method: 'GET', path: '/shop/list?shopType=2', fields: ['id', 'shopName', 'shopType', 'deliveryFee'] },
  { name: '店铺列表（小卖部）', method: 'GET', path: '/shop/list?shopType=3', fields: ['id', 'shopName', 'shopType'] },
  { name: '店铺详情', method: 'GET', path: '/shop/1', fields: ['id', 'shopName', 'minAmount'] },
  { name: '分类列表', method: 'GET', path: '/category/list?shopId=1', fields: ['id', 'shopId', 'name'] },
  { name: '商品列表（按店铺）', method: 'GET', path: '/goods/list?shopId=1', fields: ['id', 'shopId', 'goodsName', 'price', 'stock'] },
  { name: '商品列表（按关键字）', method: 'GET', path: '/goods/list?keyword=拉面', fields: ['id', 'goodsName'] },
  { name: '商品详情', method: 'GET', path: '/goods/1', fields: ['id', 'goodsName', 'price', 'unit'] },

  // ---------- 驿站 ----------
  { name: '驿站列表', method: 'GET', path: '/station/list', fields: ['id', 'stationName', 'businessHours'] },

  // ---------- 购物车 ----------
  { name: '购物车列表', method: 'GET', path: '/cart/list?userId=1', fields: ['id', 'userId', 'goodsId', 'quantity'] },

  // ---------- 订单 ----------
  { name: '订单列表（按用户）', method: 'GET', path: '/order/list?userId=1', fields: ['id', 'orderNo', 'orderType', 'status', 'totalAmount'] },
  { name: '订单列表（按骑手）', method: 'GET', path: '/order/list?riderId=1', fields: ['id', 'orderNo', 'riderId'] },
  { name: '订单列表（按状态）', method: 'GET', path: '/order/list?status=1', fields: ['id', 'orderNo', 'status'] },
  { name: '订单详情（含明细）', method: 'GET', path: '/order/1', fields: ['id', 'orderNo', 'receiverBuilding', 'receiverRoom'] },
  { name: '订单明细', method: 'GET', path: '/order/items/2', fields: ['id', 'orderId', 'goodsName', 'quantity', 'amount'] },

  // ---------- 骑手 ----------
  { name: '接单大厅', method: 'GET', path: '/rider/hall', fields: ['id', 'orderNo', 'status'] },
  { name: '骑手信息（按 userId 查）', method: 'GET', path: '/rider/info?userId=2', fields: ['id', 'userId', 'realName', 'status'] },
  { name: '骑手统计', method: 'GET', path: '/rider/statistics?riderId=1', fields: ['totalOrderCount', 'creditScore'] },

  // ---------- 管理端与公告 ----------
  { name: '管理端统计', method: 'GET', path: '/admin/statistics', fields: ['todayOrderCount', 'userCount', 'riderCount'] },
  { name: '首页公告', method: 'GET', path: '/announcement/list?type=1', fields: ['id', 'title', 'type'] },
]

/** 需要动数据库的接口，默认不跑，怕把演示数据改乱 */
const writeChecks = [
  '注册：POST /user/register',
  '新增/修改/删除地址：POST /address/save、PUT /address/update、DELETE /address/{id}、PUT /address/default/{id}',
  '购物车增删改：POST /cart/add、PUT /cart/update、DELETE /cart/{id}、DELETE /cart/clear?userId=',
  '下单：POST /order/create（订单号由后端生成）',
  '骑手接单：POST /order/{id}/accept，改状态：POST /order/{id}/status，取消：POST /order/{id}/cancel',
  '管理端：POST /admin/goods/save、PUT /admin/goods/update、DELETE /admin/goods/{id}、POST /admin/shop/save、PUT /admin/shop/update、PUT /admin/user/status',
]

/** 发一个请求并检查结果，返回 { ok, reason } */
async function checkOne(check) {
  const options = { method: check.method }
  if (check.body) {
    options.headers = { 'Content-Type': 'application/json' }
    options.body = JSON.stringify(check.body)
  }

  let response
  try {
    response = await fetch(BASE_URL + check.path, options)
  } catch (error) {
    return { ok: false, reason: '连不上后端（没启动？端口不是 8080？）：' + error.message }
  }

  const text = await response.text()
  if (!response.ok) {
    return { ok: false, reason: `HTTP ${response.status}，响应内容：${text.slice(0, 100)}` }
  }

  let json
  try {
    json = JSON.parse(text)
  } catch {
    return { ok: false, reason: '返回的不是 JSON：' + text.slice(0, 100) }
  }

  // 统一返回格式检查：code 必须是数字 200
  if (typeof json.code === 'string') {
    return { ok: false, reason: `code 是字符串 "${json.code}"，前端判断 code === 200 会失败，要返回数字 200` }
  }
  if (json.code !== 200) {
    return { ok: false, reason: `code=${json.code}，msg=${json.msg}` }
  }

  const data = json.data
  if (data === null || data === undefined) {
    return { ok: false, reason: 'code 对了，但 data 是空的（数据库里有演示数据吗？）' }
  }

  // 数组取第一条、对象直接用，检查字段名有没有少的
  const one = Array.isArray(data) ? data[0] : data
  if (Array.isArray(data) && data.length === 0) {
    return { ok: true, reason: '接口通了，但返回空数组（表里可能没数据）' }
  }
  if (check.fields && one) {
    const missing = check.fields.filter((field) => !(field in one))
    if (missing.length > 0) {
      return { ok: false, reason: 'data 缺少字段：' + missing.join('、') + '（检查实体类字段名和驼峰映射）' }
    }
  }

  return { ok: true, reason: Array.isArray(data) ? `返回 ${data.length} 条` : '返回 1 个对象' }
}

/** 主流程：一条一条检查，最后打印汇总 */
async function main() {
  console.log('后端地址：' + BASE_URL)
  console.log('开始检查（只会查数据，不会改数据）\n')

  const failures = []

  for (const check of checks) {
    const result = await checkOne(check)
    const mark = result.ok ? '[通过]' : '[失败]'
    console.log(`${mark} ${check.name.padEnd(18)} ${check.method} ${check.path}`)
    if (result.reason) {
      console.log('       ' + result.reason)
    }
    if (!result.ok) {
      failures.push(`${check.name}（${check.method} ${check.path}）：${result.reason}`)
    }
  }

  console.log('\n================ 检查结果 ================')
  console.log(`共 ${checks.length} 个查询接口，通过 ${checks.length - failures.length} 个，失败 ${failures.length} 个`)

  if (failures.length > 0) {
    console.log('\n失败清单：')
    failures.forEach((item, index) => console.log(`  ${index + 1}. ${item}`))
    console.log('\n常见原因：404 看路径前缀、500 看 IDEA 控制台、连不上看后端有没有启动、字段缺失看实体类字段名。')
  } else {
    console.log('查询类接口全部通过，可以关掉假数据联调了（.env.development 里 VITE_USE_MOCK 改成 false）。')
  }

  console.log('\n下面这些接口会改数据库，脚本没跑，请用页面点一遍：')
  writeChecks.forEach((item) => console.log('  - ' + item))
  console.log('\n提示：跨域（CORS）问题脚本查不出来（脚本不是浏览器），页面报 CORS 时看 docs/02 第三节。')
}

main()
