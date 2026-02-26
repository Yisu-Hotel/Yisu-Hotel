# Yisu Hotel 移动端技术文档（前后端）

本文档将 `d:\github\Yisu-Hotel\M\tech-doc.md` 与 `d:\github\Yisu-Hotel\M\Yisu-Hotel-M\移动端技术文档-后端对接.md` 的内容整理合并，并按“前端 / 后端”拆分，便于移动端联调与维护。

对接文档原始文件：[移动端技术文档-后端对接.md](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/%E7%A7%BB%E5%8A%A8%E7%AB%AF%E6%8A%80%E6%9C%AF%E6%96%87%E6%A1%A3-%E5%90%8E%E7%AB%AF%E5%AF%B9%E6%8E%A5.md)

涉及工程：

- 前端工程：`d:\github\Yisu-Hotel\M\Yisu-Hotel-M\`
- 后端工程：`d:\github\Yisu-Hotel\M\Yisu-Hotel-backend\`

## 1. 前端（Yisu-Hotel-M）

### 1.1 技术栈与构建

- 框架：Taro 4 + React 18（多端：weapp/h5 等）
  - 依赖入口：[package.json](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/package.json#L1-L91)
- 组件库：taro-ui、@nutui/nutui-react-taro
  - 依赖入口：[package.json](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/package.json#L39-L61)
- 编译器：Vite（Taro Vite runner）
  - 构建配置：[config/index.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/config/index.js#L1-L100)
- 小程序项目配置：微信开发者工具读取 `dist`
  - [project.config.json](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/project.config.json#L1-L15)
- H5 地图：酒店详情页在 H5 环境加载高德 JSAPI，并使用 `VITE_AMAP_KEY / VITE_AMAP_SECURITY_CODE`（键名）
  - 位置：[hotel-detail/index.jsx](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/pages/hotel-detail/index.jsx#L1-L179)

常用脚本（以 package.json 为准）：

- `npm run dev:weapp`：微信小程序开发（watch）
- `npm run build:weapp`：微信小程序构建
- `npm run dev:h5` / `npm run build:h5`：H5 开发/构建

### 1.2 入口与路由

- 应用入口：[app.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/app.js#L1-L20)
  - App 启动时会执行一次 `mockLogin()`（用于本地/联调的测试 token）
- 路由与 TabBar 注册：[app.config.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/app.config.js#L1-L60)
  - Tab 页：`pages/index/index`、`pages/order/order`、`pages/my/my`

### 1.3 API 请求封装与错误码约定（前端侧）

移动端 API 请求统一封装在 [api.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/services/api.js#L1-L561)：

- BaseURL：当前写死为 `http://localhost:3001`
- Token：若本地存在 `token`，会自动注入 `Authorization: Bearer <token>`
- 错误处理：后端返回 `code === 4008` 时会清理登录态与缓存，并跳转登录页
- GET 缓存：GET 请求基于 URL + body 生成 cacheKey 做本地缓存（默认 5 分钟）

### 1.4 全局存储与事件约定

前端广泛使用 `Taro.setStorageSync/getStorageSync` 做跨页面传参、登录态与临时缓存（键名以代码为准）：

- 登录态：`token`、`isLoggedIn`、`userInfo`、`lastLoginPhone`
- 搜索与筛选：`global_search_params`、`citySearchHistory`
- 下单与支付链路：`bookingConfirmPayload`、`paymentPayload`
- 业务本地数据：`browsingHistory`、`userCoupons`
- AI/客服：`mobile_chat_history`

跨页面事件（`Taro.eventCenter`）：

- `userLoggedIn`：[login.jsx](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/pages/login/login.jsx#L76-L101)、[my.jsx](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/pages/my/my.jsx#L89-L105)
- `favoritesChanged`：[hotel-detail/index.jsx](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/pages/hotel-detail/index.jsx#L339-L366)、[favorites.jsx](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/pages/favorites/favorites.jsx#L13-L27)
- `refreshCoupons`：[payment/index.jsx](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/pages/payment/index.jsx#L251-L257)、[coupons.jsx](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/pages/coupons/coupons.jsx#L42-L52)

### 1.5 核心页面与接口（以 api.js 为准）

以下按典型业务链路（搜索 → 详情 → 下单 → 支付/优惠券）整理，页面注册以 [app.config.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/app.config.js#L1-L60) 为准。

- 首页：`pages/index/index`（[index.jsx](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/pages/index/index.jsx)）
  - Banner：`GET /mobile/banner/list`
  - 推荐酒店：`GET /mobile/hotel/list`
  - 首页聚合：`GET /mobile/home/data`
  - 备注：首页搜索参数既可能使用 `city`，也可能使用 `location`，最终都会拼到 `/mobile/hotel/list` 的 query string
- 酒店列表：`pages/hotel-list-new/hotel-list-new`（[hotel-list-new.jsx](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/pages/hotel-list-new/hotel-list-new.jsx)）
  - 列表：`GET /mobile/hotel/list`
- 酒店详情：`pages/hotel-detail/index`（[index.jsx](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/pages/hotel-detail/index.jsx)）
  - 详情：`GET /mobile/hotel/:hotelId`
  - 收藏：`POST /mobile/favorite/add`、`POST /mobile/favorite/remove`、`GET /mobile/favorite/list`
  - 日期组件：[DateSelector](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/components/DateSelector/index.jsx)
- 预订确认：`pages/booking-confirm/index`（[index.jsx](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/pages/booking-confirm/index.jsx)）
  - 创建预订：`POST /mobile/booking`
  - 优惠券列表：`GET /mobile/coupon/list`
- 支付：`pages/payment/index`（[index.jsx](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/pages/payment/index.jsx)）
  - 订单详情：`GET /mobile/booking/detail/:id`
  - 使用优惠券：`POST /mobile/coupon/use`
  - 支付预订：`POST /mobile/booking/pay`
- 订单：`pages/order/order`（[order.jsx](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/pages/order/order.jsx)）
  - 列表：`GET /mobile/booking/list`
  - 取消：`POST /mobile/booking/cancel`
- 我的：`pages/my/my`（[my.jsx](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/pages/my/my.jsx)）
  - 用户资料：`GET /mobile/user/profile`
- 登录/注册：`pages/login/login`、`pages/register/register`
  - 登录：`POST /mobile/auth/login`
  - 注册：`POST /mobile/auth/register`
  - 验证码：`POST /mobile/auth/send-code`
- AI 助手：`pages/ai-assistant/ai-assistant`（[ai-assistant.jsx](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/pages/ai-assistant/ai-assistant.jsx)）
  - 对话：`POST /mobile/chat/completion`
- 客服中心：`pages/customer-service/customer-service`（[customer-service.jsx](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/pages/customer-service/customer-service.jsx)）
  - 本地知识库检索：[knowledge.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/services/knowledge.js#L114-L126)
  - 对话：`POST /mobile/chat/completion`
- 帮助中心：`pages/help-center/help-center`（[help-center.jsx](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/pages/help-center/help-center.jsx)）
  - FAQ：`GET /mobile/help/center`

## 2. 后端（Yisu-Hotel-backend）

### 2.1 项目概览

后端采用分层结构（Route → Controller → Service → Model），并同时提供：

- PC 端接口（管理/商家端）：`/auth`、`/user`、`/hotel`、`/admin`
- 移动端接口（小程序/多端）：`/mobile/...`（认证、酒店、预订、支付、优惠券、AI 等）

服务入口与路由挂载：[app.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/app.js#L1-L134)

### 2.2 技术栈与依赖

- Node.js + Express（当前依赖为 express 5）
  - 依赖入口：[package.json](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/package.json#L1-L40)
- ORM：Sequelize
- 数据库：PostgreSQL（通过 `DATABASE_URL` 连接）
  - 连接配置：[database.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/config/database.js#L1-L15)
- 鉴权：JWT（jsonwebtoken）
- 参数校验：express-validator（移动端部分）
- 三方：阿里云短信、智谱（BigModel）LLM（AI 助手）

### 2.3 启动入口与基础配置

后端启动逻辑：[app.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/app.js#L1-L134)

- 默认端口：`PORT=3001`（未配置则使用 3001）
- 健康检查：
  - `GET /api/status`
  - `GET /api/test`
- 路由未统一挂载 `/api` 前缀，移动端接口实际挂载在 `/mobile/...`

### 2.4 环境变量（只列键名）

后端通过 `.env` 注入配置（注意不要在文档/日志中暴露密钥类字段）：

- `PORT`：服务端口
- `DATABASE_URL`：PostgreSQL 连接串
- `JWT_SECRET`：JWT 签名密钥
- `JWT_EXPIRES_IN`：JWT 过期时间（可选，示例：`2h` 或秒数）
- `accessKeyId` / `accessKeySecret`：阿里云短信 AccessKey（敏感信息）
- `AMAP_KEY` / `AMAP_SECURITY_CODE`：后端高德相关密钥（敏感信息）
- `AI_API_KEY`：LLM（智谱）API Key（敏感信息）

### 2.5 代码结构与模型

- 路由层：`src/routes/**`
- 控制器：`src/controllers/**`
- 业务服务：`src/services/**`
- 中间件：`src/middlewares/**`
- 数据模型：`src/models/**`
- 工具方法：`src/utils/**`
- AI Agent：`src/agent/**`

Sequelize 模型入口与核心关联关系定义在 [models/index.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/models/index.js#L1-L161)。

### 2.6 通用响应结构与错误码

后端常见响应结构如下：

```json
{
  "code": 0,
  "msg": "请求成功",
  "data": {}
}
```

- `code === 0`：成功
- `code !== 0`：业务错误
- `code === 4008`：Token 无效或已过期
  - 后端中间件：[mobile/auth.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/middlewares/mobile/auth.js#L1-L40)
  - 前端拦截处理：[api.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-M/src/services/api.js#L153-L174)

### 2.7 JWT 鉴权（移动端）

需要鉴权的接口在请求头加入：

```http
Authorization: Bearer <token>
```

后端鉴权中间件：[mobile/auth.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/middlewares/mobile/auth.js#L1-L40)

- 校验成功写入：`req.user = { user_id, phone, role }`
- 校验失败返回：HTTP 401 + `{ code: 4008, msg: 'Token 无效或已过期', data: null }`

移动端参数校验（部分接口使用 `express-validator`）：[validator.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/middlewares/mobile/validator.js#L1-L134)

### 2.8 移动端接口模块（/mobile）

路由挂载总览：[app.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/app.js#L84-L107)

- 认证 `/mobile/auth`：[routes/mobile/auth.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/routes/mobile/auth.js#L1-L21)
  - `POST /mobile/auth/send-code`、`POST /mobile/auth/register`、`POST /mobile/auth/login`、`PUT /mobile/auth/reset-password`
  - 实现：controller [auth.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/controllers/mobile/auth.js#L1-L92) → service [auth.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/services/mobile/auth.js#L1-L249)
- 首页 `/mobile/home`：[routes/mobile/home.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/routes/mobile/home.js#L1-L14)
  - `GET /mobile/home/data`
- 酒店 `/mobile/hotel`：[routes/mobile/hotel.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/routes/mobile/hotel.js#L1-L54)
  - `GET /mobile/hotel/list`、`GET /mobile/hotel/detail/:id`、`GET /mobile/hotel/search`
  - 兼容调用：`GET /mobile/hotel/:hotel_id`
  - 实现：controller [hotel.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/controllers/mobile/hotel.js#L20-L157) → service [hotel.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/services/mobile/hotel.js#L1-L320)
- 预订 `/mobile/booking`：[routes/mobile/booking.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/routes/mobile/booking.js#L1-L25)
  - `POST /mobile/booking`、`GET /mobile/booking/list`、`GET /mobile/booking/detail/:id`、`POST /mobile/booking/cancel`、`POST /mobile/booking/pay`
  - 实现：controller [booking.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/controllers/mobile/booking.js#L19-L96) → service [booking.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/services/mobile/booking.js#L1-L356)
- 优惠券 `/mobile/coupon`：[routes/mobile/coupon.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/routes/mobile/coupon.js#L1-L18)
  - `GET /mobile/coupon/list`、`POST /mobile/coupon/receive`、`POST /mobile/coupon/use`
  - 实现：service [coupon.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/services/mobile/coupon.js#L1-L360)
- 收藏 `/mobile/favorite`：[routes/mobile/favorite.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/routes/mobile/favorite.js#L1-L15)
  - `POST /mobile/favorite/add`、`POST /mobile/favorite/remove`、`GET /mobile/favorite/list`
- 支付 `/mobile/payment`：[routes/mobile/payment.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/routes/mobile/payment.js#L1-L113)
  - `POST /mobile/payment/create`、`POST /mobile/payment/pay`、`GET /mobile/payment/status/:order_id`、`POST /mobile/payment/callback`
- 帮助中心 `/mobile/help`：[help.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/routes/mobile/help.js#L1-L122)
  - `GET /mobile/help/center`

### 2.9 阿里云短信验证码（移动端）

- 路由：`POST /mobile/auth/send-code`（[routes/mobile/auth.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/routes/mobile/auth.js#L1-L21)）
- 验证码生成：[code.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/utils/code.js#L1-L16)
- 验证码模型：[VerificationCode.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/models/entities/VerificationCode.js#L1-L45)
- 短信工具封装：[sms.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/utils/sms.js#L1-L59)

### 2.10 优惠券定时任务

启动后会进行数据库连通性检查，并启动优惠券定时任务：

- [coupon-tasks.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/tasks/coupon-tasks.js#L1-L63)

### 2.11 移动端 AI 助手（/mobile/chat）

- 路由：[chat.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/routes/mobile/chat.js#L1-L27)
- 接口：
  - `GET /mobile/chat/info`
  - `GET /mobile/chat/health`
  - `POST /mobile/chat/completion`

核心链路：

1) 先检索本地知识库（命中则直接返回）

- [knowledgeBase.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/agent/knowledge/knowledgeBase.js#L1-L145)
- [chatController.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/agent/controllers/chatController.js#L79-L105)

2) 未命中则走 Agent + LLM：

- Agent 调度器：[customerAgent.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/agent/core/customerAgent.js#L1-L203)
- LLM 封装：[llmService.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/agent/services/llmService.js#L1-L41)

3) 工具调用（可选）：`hotel_search`

- 工具定义与执行：[hotelTool.js](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/src/agent/services/hotelTool.js#L1-L83)

## 3. 现有接口文档索引（仓库内）

- 移动端 API：目录 [docs/mobile](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/docs/mobile)
  - 例如 [Auth_API.md](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/docs/mobile/Auth_API.md)、[Hotel_API.md](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/docs/mobile/Hotel_API.md)、[Booking_API.md](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/docs/mobile/Booking_API.md)
- PC 端 API：目录 [docs/pc](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/docs/pc)
  - 例如 [Auth_API.md](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/docs/pc/Auth_API.md)、[Hotel_API.md](file:///d:/github/Yisu-Hotel/M/Yisu-Hotel-backend/docs/pc/Hotel_API.md)
