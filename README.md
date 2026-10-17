# 校园代跑腿平台（示例项目）

一个校园里的跑腿平台前端，包含 **代取快递 / 校园外卖 / 送货上门的小卖部** 三大业务，分
**顾客端、骑手端、管理端** 三种角色。后端由同学用 SpringBoot 自己写，本项目只提供前端代码和对接约定。

前端技术栈：Vue 3 + TypeScript + Vite + Element Plus + Pinia + Vue Router + axios。

登录和注册走**真实接口**（`POST /api/user/login`、`POST /api/user/register`）。
登录成功后的用户信息保存在浏览器里（localStorage），
后端不需要 JWT / token / 拦截器，详见 [02-后端对接说明](docs/02-后端对接说明.md) 第七节。

## 一、怎么跑起来

```bash
npm install          # 第一次运行需要，装依赖
npm run dev          # 启动开发服务器
```

打开 <http://localhost:5173> 就能看到页面。默认使用假数据（`src/api/mock.ts`），
**不需要后端也能把页面完整点一遍**，方便先看效果、再写后端。

其他命令：

```bash
npm run build        # 打包（会先做 TypeScript 类型检查）
npm run preview      # 本地预览打包结果
```

## 二、目录结构

```
src/
├── main.ts              程序入口：注册 Pinia、路由、Element Plus
├── App.vue              根组件：只负责显示当前路由对应的页面
├── style.css            全局样式（只有重置和几个公共类名）
├── config/index.ts      项目配置：接口前缀、是否用假数据
├── types/index.ts       所有数据结构的 TypeScript 定义（先看这个文件）
├── api/                 和后端打交道的地方，一个业务一个文件
│   ├── request.ts       axios 统一封装（拆 data、统一报错）
│   ├── mock.ts          假数据（关掉 mock 后可以整份删掉）
│   └── user/address/store/express/cart/order/rider/admin/announcement.ts
├── stores/              Pinia 状态：user.ts（登录用户）、cart.ts（购物车）、rider.ts（骑手）
├── router/              路由
│   ├── index.ts         总入口 + 网页标题 + “要登录”的页面提示
│   └── modules/         account.ts（登录注册404）、customer.ts（顾客端）、rider.ts（骑手端）、admin.ts（管理端）
├── layouts/             BasicLayout.vue（顶部导航）、AdminLayout.vue（左侧菜单）
├── components/          PageTitle / EmptyBox / GoodsCard / OrderStatusTag
├── utils/               format.ts（金额时间）、dict.ts（状态翻译）、storage.ts
└── views/               页面，按业务分文件夹
    ├── login/           登录页、注册页
    ├── home/            首页
    ├── express/         代取快递下单
    ├── store/           店铺列表、店铺点单（外卖和小卖部共用）
    ├── cart/            购物车结算
    ├── order/           我的订单、订单详情
    ├── rider/           接单大厅、我的跑腿
    ├── profile/         个人中心 + 地址管理
    ├── admin/           数据概览、商品管理、订单管理、用户管理
    └── error/           404
```

读代码的顺序建议：`types/index.ts` → `api/` → `stores/` → `views/`。
每个文件都写清楚了它负责什么，文件名和业务一一对应，不怕找不到。

## 三、状态管理（Pinia）

需要“好几个页面共用一份、而且会变”的数据，都放在 `src/stores/` 里，一个业务一个文件：

| store | 放什么 | 谁在用 |
| --- | --- | --- |
| [user.ts](src/stores/user.ts) | 当前登录用户（`isLogin`、`userId`、`isRider`、`isAdmin`、`displayName`） | 顶部导航、路由守卫、登录页、个人中心、所有要传 `userId` 的页面 |
| [cart.ts](src/stores/cart.ts) | 购物车列表（`totalCount`、`totalAmount`、`shopId`） | 顶部角标、点单页底部条、购物车页 |
| [rider.ts](src/stores/rider.ts) | 骑手信息、接单状态、业绩统计、待接单大厅 | 接单大厅 |

三个 store 写法完全一致，都是三段式：

| 部分 | 作用 | 对应 Vue 的写法 |
| --- | --- | --- |
| `state` | 存数据 | `ref` / `reactive` |
| `getters` | 由 state 算出来的值，只读 | `computed` |
| `actions` | 改数据的方法，可以调接口、可以是 async | `methods` |

可以把它当成**一个天生单例的 `@Service` 类**：`state` 是字段，`getters` 是 getter 方法，
`actions` 是成员方法，`useXxxStore()` 相当于 `@Autowired` 拿到那个唯一的实例。

**什么时候该放进 store**

- 两个以上页面要读写同一份 → 放（登录用户、购物车、骑手信息）
- 只有一个页面用的临时状态（弹窗显隐、输入框内容、`loading` 遮罩）→ **不要放**，`ref` 就够
- 父子组件传值 → 用 `props` / `emit`，不要放

**两条硬规矩**

1. 改数据一律走 action（`userStore.logout()`、`riderStore.changeStatus(1)`），不要在页面里直接
   `userStore.currentUser = xxx`——只有 action 里才会同时处理接口请求、localStorage 和失败回滚；
2. 从 store 里解构 state / getters 必须用 `storeToRefs`，否则解构出来的只是普通值，store 变了页面不会跟着变。

## 四、登录、注册和三种身份

打开 <http://localhost:5173/login>（或在页面右上角点“登录”），用下面的演示账号登录。
登录页上放着这三个账号的按钮，点一下会自动填进表单，密码统一是 `123456`：

| 用户 | 用户名 | 密码 | 身份 | 登录后能做什么 |
| --- | --- | --- | --- | --- |
| 张小明 | xiaoming | 123456 | 顾客 | 下单、看订单、管地址 |
| 李大力 | dali | 123456 | 骑手 | 接单大厅抢单、标记送达 |
| 王老师 | wanglaoshi | 123456 | 管理员 | 数据概览、商品 / 订单 / 用户管理 |

登录过程就一步：把用户名密码发给 `POST /api/user/login`，后端查一次 user 表，返回用户信息就算成功。
**没有 token，没有 JWT，没有拦截器**：用户信息存在 localStorage 里，刷新页面不会丢；点“退出登录”只是把它清掉，不用请求后端。

注册在 <http://localhost:5173/register>，注册出来的账号身份固定是“顾客”（role = 1），注册成功后回到登录页自己登一次。

顶部的“骑手工作台”和“管理端”入口只对相应身份的账号显示；直接输网址也能打开，只是页面上会提示一句“当前账号不是骑手 / 管理员”——这只是界面提示，后端没有做任何权限校验。

## 五、后端需要的端口

| 服务 | 端口 | 说明 |
| --- | --- | --- |
| 前端 Vite 开发服务器 | 5173 | 页面地址 http://localhost:5173 |
| 后端 SpringBoot | 8080 | 接口地址 http://localhost:8080/api/xxx，**不加 context-path** |
| MySQL | 3306 | 数据库名 campus_errand，建议账号 root / 123456 |
| Redis | 6379 | 本项目**不需要**，示例项目没用到缓存 |
| 生产 Nginx | 80 | 打包上线时才用 |

开发时前端请求的 `/api` 由 Vite 代理转发到 8080（配置在 `vite.config.ts`），所以浏览器看不到跨域。
后端仍然要配一次跨域（`CorsConfig`），代码见 [02-后端对接说明](docs/02-后端对接说明.md)。

## 六、数据库

共 **13 张表**，建库脚本在 [sql/campus_errand.sql](sql/campus_errand.sql)，直接复制到 Navicat 或命令行执行即可
（含建库、建表、演示数据）。

| 表名 | 作用 |
| --- | --- |
| user | 用户（顾客 / 骑手 / 管理员都在这里，用 role 区分） |
| address | 收货地址 |
| rider | 骑手扩展信息 |
| shop | 店铺（校园外卖 + 小卖部共用，用 shop_type 区分） |
| goods_category | 商品分类 |
| goods | 商品 |
| express_station | 快递驿站（代取快递的取件点） |
| orders | 订单主表（三种业务共用，用 order_type 区分） |
| order_item | 订单商品明细 |
| order_status_log | 订单状态流水 |
| cart | 购物车 |
| order_review | 订单评价（预留） |
| announcement | 首页公告 / 轮播图 |

每个字段的含义、状态值对照、表之间的关系，见 [01-数据库设计](docs/01-数据库设计.md)。

## 七、文档导航

| 文档 | 内容 |
| --- | --- |
| [01-数据库设计](docs/01-数据库设计.md) | 13 张表的逐字段说明、关系图、状态值速查 |
| [02-后端对接说明](docs/02-后端对接说明.md) | 端口、跨域、统一返回格式、application.yml、包结构、编码顺序 |
| [03-接口清单](docs/03-接口清单.md) | 每个接口的路径、参数、返回值、后端要做的逻辑 |

## 八、和后端联调的三步

1. 用 `sql/campus_errand.sql` 建好库和表；
2. 启动 SpringBoot，确认 <http://localhost:8080/api/user/list> 能看到 3 个用户的 JSON；
3. 把 `.env.development` 里的 `VITE_USE_MOCK` 改成 `false`，重启 `npm run dev`，然后用 `xiaoming / 123456` 登录。

页面上的数据就来自数据库了。约定：所有接口统一返回 `{ code, msg, data }`，
`code` 必须是数字 `200` 才表示成功，前端会把 `msg` 直接弹给用户看。

## 九、一个订单的完整流转（联调时按这个顺序点）

三个业务（代取快递 / 校园外卖 / 小卖部）共用同一张 `orders` 表和同一套状态，只是 `order_type` 不同：

```
顾客下单                骑手抢单              骑手送达              顾客确认
status: 1 待接单  →   status: 2 配送中  →   status: 3 已完成
```

| 步骤 | 谁操作 | 页面 | 调用的接口 |
| --- | --- | --- | --- |
| 1 | 顾客 | 代取快递 / 点单 / 购物车 | `POST /api/order/create`（新单 status = 1） |
| 2 | 骑手 | 接单大厅 | `GET /api/order/list?status=1` 看大厅 → `POST /api/order/{id}/accept`（status 变 2） |
| 3 | 骑手 | 我的跑腿 | `POST /api/order/{id}/status`（body: `{status: 3}`，同时写 finishTime） |
| 4 | 顾客 | 我的订单 / 订单详情 | 看到“已完成”（骑手没点送达时，顾客也能点“确认收货”改成 3） |
| 5 | 顾客 | 订单详情（待接单时） | `POST /api/order/{id}/cancel`（status 变 4） |

## 十、接手的同学可以继续做的事

- 接口鉴权（现在谁都能调所有接口，要加的话就是 JWT + 拦截器，本示例没做）
- 订单分页（现在一次返回全部，`types/index.ts` 里的 `OrderQuery` 已经预留 pageNum / pageSize）
- 图片上传（商品和店铺的 image 字段现在都是空字符串，页面上用商品名首字做占位）
- 订单评价（`order_review` 表已经建好，前端还没做页面）
- 把“我的跑腿”页也改成读 `stores/rider.ts`，两个骑手页面共用同一份数据（现在它自己查了一遍）
- 骑手结算、优惠券、消息通知

## 十一、几个约定（改代码前先看）

- 金额一律用 `utils/format.ts` 的 `formatMoney` 显示，不用自己写 `toFixed`；
- 状态数字转中文一律用 `utils/dict.ts` 里的方法，不要在每个页面各写一套；
- **金额必须由后端重新计算**，前端传的 `deliveryFee` 只用于页面展示；
- 每个页面的样式写在各自的 `<style scoped>` 里，公共样式才放到 `style.css`；
- 页面里只写“调 action + 弹提示 + 渲染”，业务逻辑和数据放 `stores/` 和 `api/`。

>（该文档由AI根据项目生成，有点懒了...）
