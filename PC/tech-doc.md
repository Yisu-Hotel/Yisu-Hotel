# Yisu-Hotel PC 后端技术要点说明（Yisu-Hotel-backend）

本文基于目录 [Yisu-Hotel-backend](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend) 的现有实现整理，侧重说明：接口模块划分、JWT 认证、阿里云短信验证码、智能 Agent 助手（知识库 + 工具调用）、以及酒店图片的存储与传输方案。

## 1. 项目概览

- 服务框架：Express（[app.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/app.js)）
- 数据层：Sequelize + PostgreSQL（[database.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/config/database.js)、[models/index.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/models/index.js)）
- 认证：JWT（[middlewares/pc/user.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/middlewares/pc/user.js)、[services/pc/auth.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/services/pc/auth.js)）
- 短信：阿里云 dypnsapi（[utils/sms.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/utils/sms.js)）
- 智能助手：基于 OpenAI SDK 的“智谱 GLM”对话调用 + 工具调用（函数调用）+ 本地知识库检索（[src/agent](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/agent)）
- 图片：接收前端 base64，落盘到“前端 public 静态目录”，通过 URL 访问（[services/pc/hotel.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/services/pc/hotel.js)）

## 2. 运行入口与基础配置

### 2.1 服务入口与路由挂载

入口文件为 [app.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/app.js)，主要做了：

- `cors()` 跨域放开
- `express.json({ limit: '100mb' })`：为了承载图片 base64 等大 payload，将 JSON body 上限提升到 100MB
- 健康检查接口：
  - `GET /api/status`
  - `GET /api/test`
- 业务路由挂载（无 `/api` 前缀）：
  - `/auth`、`/user`、`/hotel`、`/admin`、`/chat`
- 端口：`PORT = process.env.PORT || 3000`

### 2.2 环境变量（.env）

代码中显式依赖的关键环境变量：

- `DATABASE_URL`：Postgres 连接串（[database.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/config/database.js)）
- `JWT_SECRET`：JWT 签名密钥（[services/pc/auth.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/services/pc/auth.js)、[middlewares/pc/user.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/middlewares/pc/user.js)）
- `PORT`：后端端口（[app.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/app.js)）
- `accessKeyId` / `accessKeySecret`：阿里云调用凭证（[utils/sms.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/utils/sms.js)）
- `AI_API_KEY`：智能助手模型 API Key（[llmService.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/agent/services/llmService.js)）

## 3. 代码组织结构（PC 后端）

后端核心结构（见 [src](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src)）：

- `routes/pc/*`：路由层（路径 + 中间件链 + controller）
- `middlewares/pc/*`：参数校验、JWT 校验、权限校验、payload 归一化
- `controllers/pc/*`：控制器层（组装输入、调用 service、统一返回结构）
- `services/pc/*`：业务服务层（事务、模型读写、复杂聚合）
- `models/*`：Sequelize Model 与关联关系（[models/index.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/models/index.js)）
- `utils/*`：工具函数（验证码、短信、校验、酒店查询构造等）
- `agent/*`：智能 Agent（Prompt、LLM 调用、知识库、工具定义与执行）

## 4. PC 端接口模块（路由与职责）

说明：以下路径均以 `http://localhost:{PORT}` 为 base（`PORT` 为后端端口）。

### 4.1 认证模块 /auth

路由文件：[routes/pc/auth.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/routes/pc/auth.js)

- `POST /auth/check-account`：检查手机号是否已注册
- `POST /auth/send-code`：发送验证码（注册/重置等场景）
- `POST /auth/register`：注册并签发 JWT
- `POST /auth/login`：登录并签发 JWT（支持自定义 `token_expires_in` 秒数）
- `POST /auth/forgot-password`：忘记密码（发验证码）
- `POST /auth/reset-password`：重置密码

输入校验中间件：[middlewares/pc/auth.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/middlewares/pc/auth.js)

业务实现（验证码频控、入库、加密、签发 Token）：[services/pc/auth.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/services/pc/auth.js)

### 4.2 用户模块 /user

路由文件：[routes/pc/user.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/routes/pc/user.js)

- `GET /user/profile`：获取个人资料（JWT 必需）
- `PUT /user/profile`：更新个人资料（JWT 必需）
- `GET /user/messages?page=1`：获取站内消息（JWT 必需，默认每页 5）

中间件要点：

- JWT 校验：[authenticateToken](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/middlewares/pc/user.js#L10-L42)
- 更新资料的字段合法性校验：[validateUpdateProfile](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/middlewares/pc/user.js#L51-L162)
- 消息列表分页参数校验：[validateMessageListQuery](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/middlewares/pc/user.js#L164-L197)

### 4.3 酒店模块 /hotel

路由文件：[routes/pc/hotel.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/routes/pc/hotel.js)

- `POST /hotel/create`：创建酒店（支持“保存草稿”）
- `PUT /hotel/update/:id`：更新酒店（支持“保存草稿”）
- `GET /hotel/list`：酒店列表（分页、状态、关键字）
- `GET /hotel/detail/:id`：酒店详情
- `GET /hotel/audit-status/:id`：审核状态（返回审核日志）
- `DELETE /hotel/delete/:id`：删除酒店（按规则校验）

输入结构的关键点（创建/更新）：

- 前端以 `room_prices` 对象组织房型：`{ "大床房": { bed_type, area, prices, ... }, ... }`
- 中间件会将 `room_prices` 归一化成 `room_types` 数组（供 service 持久化）
- 主图支持两种输入并最终合并成 URL 数组：
  - `main_image_url`：已存在图片 URL（数组）
  - `main_image_base64`：新上传图片 base64（允许数组或单字符串；中间件统一成数组）

中间件实现：[middlewares/pc/hotel.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/middlewares/pc/hotel.js)

业务实现（事务、落库、图片落盘、关联表写入）：[services/pc/hotel.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/services/pc/hotel.js)

### 4.4 管理员模块 /admin

路由文件：[routes/pc/admin.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/routes/pc/admin.js)

- `GET /admin/hotel/audit-list`：审核列表（筛选 + 分页）
- `GET /admin/hotel/detail/:id`：管理员查看酒店详情
- `POST /admin/hotel/batch-audit`：批量审核（通过/驳回），并写入站内消息

权限与参数校验：

- JWT 必需：`authenticateToken`
- 角色必须为 `admin`：[requireAdmin](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/middlewares/pc/admin.js#L10-L19)
- 查询参数/批量审核参数校验：[middlewares/pc/admin.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/middlewares/pc/admin.js)

### 4.5 智能助手模块 /chat

路由文件：[routes/pc/chat.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/routes/pc/chat.js)

- `POST /chat/completions`：类 Chat Completions 的接口（JWT 必需）

入参格式校验来自 Agent 层：[chatValidator.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/agent/chatValidator.js)

控制器为薄封装：[controllers/pc/chat.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/controllers/pc/chat.js) → [agent/chatController.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/agent/chatController.js)

## 5. JWT 认证与权限控制

### 5.1 Token 签发

Token 由认证服务签发（[services/pc/auth.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/services/pc/auth.js)）：

- `register` 成功后签发 `expiresIn: '2h'`
- `login` 默认 `expiresIn: '2h'`，也可通过 `token_expires_in`（秒）自定义（例如 30 天）
- Token Payload：`{ userId, phone, role }`

### 5.2 Token 校验与请求注入

JWT 校验中间件：[authenticateToken](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/middlewares/pc/user.js#L10-L42)

- 从请求头读取：`Authorization: Bearer <token>`
- 使用 `process.env.JWT_SECRET` 校验
- 校验成功将 `decoded` 挂到 `req.user`，供后续业务使用
- 校验失败统一返回：
  - HTTP 401
  - `{ code: 4008, msg: 'Token 无效或已过期', data: null }`

### 5.3 管理员权限

管理员接口在 JWT 通过后，额外要求 `req.user.role === 'admin'`（[requireAdmin](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/middlewares/pc/admin.js#L10-L19)）。

## 6. 阿里云短信验证码服务

短信服务工具类：[utils/sms.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/utils/sms.js)

- 使用阿里云 SDK：`@alicloud/dypnsapi20170525` + `@alicloud/credentials`
- `createClient()` 通过 `accessKeyId/accessKeySecret` 构造凭证并指定 endpoint：`dypnsapi.aliyuncs.com`
- `sendVerifyCode(phoneNumber, code)`：发送验证码
  - `signName`、`templateCode`、`templateParam` 在代码中固定配置

验证码业务流程（[services/pc/auth.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/services/pc/auth.js)）：

- 发送频控：同一 `phone + type`，60 秒内只能发一次（否则抛出 `code=3002`）
- 入库：`VerificationCode` 表保存 `code / expires_at / used`
- 过期时间：60 秒

## 7. 智能 Agent 助手（知识库 + 工具调用）

### 7.1 模型调用封装

LLM 调用封装在 [llmService.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/agent/services/llmService.js)：

- 使用 `openai` SDK，但将 `baseURL` 指向智谱平台：`https://open.bigmodel.cn/api/paas/v4`
- 默认模型：`glm-5`
- API Key：`process.env.AI_API_KEY`

### 7.2 Tool（函数）定义与执行

工具定义与执行在 [knowledgeBaseTool.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/agent/services/knowledgeBaseTool.js)：

- 对外暴露一个工具：`knowledge_base_search`
- 参数：
  - `query`（必填）
  - `limit`（默认 3）
- 执行逻辑：对本地知识库进行关键词命中计分，返回 `context + matches`

知识库数据（示例）位于 [knowledgeData.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/agent/services/knowledgeData.js)。

### 7.3 两阶段 Agent 调度

Agent 核心调度器：[merchantAgent.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/agent/core/merchantAgent.js)

- 第一轮：携带 `tools` 调用模型，`tool_choice: 'auto'`，让模型自行决定是否触发工具
- 如果模型返回 `tool_calls`：
  - 仅接受 `knowledge_base_search`，解析参数并执行本地检索
  - 将检索结果以 `role: 'tool'` 消息回填给模型
- 第二轮：携带工具结果再次调用模型，`tool_choice: 'none'`，输出最终自然语言答案

Prompt 模板位于 [merchantPrompt.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/agent/prompts/merchantPrompt.js)。

## 8. 图片存储与传输方案（核心问题与实现）

### 8.1 主要问题

- 图片以 base64 在接口中传输会显著增大 payload，且数据库直接存 base64 会造成：
  - 表体积膨胀、查询变慢
  - 列表/详情接口返回数据过大
  - 前端展示需要额外解码处理

### 8.2 当前方案：base64 落盘为图片文件 + 返回 URL

后端在“创建/更新酒店”时对图片做了“落盘 + URL 化”的处理（[services/pc/hotel.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/services/pc/hotel.js)）：

- **保存目录**（落到 PC 前端项目的 `public` 静态目录）：
  - 房型图：`../../../../Yisu-Hotel-PC/public/room_image`
  - 酒店主图：`../../../../Yisu-Hotel-PC/public/main_image`
- **URL 前缀**（由前端静态服务器提供访问能力）：
  - `http://localhost:3000/room_image/<filename>`
  - `http://localhost:3000/main_image/<filename>`
- **格式兼容**：
  - 支持 dataURL：`data:image/png;base64,...`
  - 支持纯 base64 字符串
  - 扩展名优先从 MIME 推断；若无法推断，默认 `png`
- **文件命名规则**：`<prefix>-<timestamp>-<random>.<ext>`

### 8.3 入参与归一化规则（避免前后端形态不一致）

酒店创建/更新中间件（[middlewares/pc/hotel.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/middlewares/pc/hotel.js)）对图片字段做了归一化：

- `main_image_base64`：允许数组或单字符串，最终归一为数组 `main_image_base64: string[]`
- `room_image_base64`：每个房型允许单张 base64
- 已有 URL 字段（`main_image_url`、`room_image_url`）会被保留并与新落盘 URL 合并

### 8.4 数据库存储策略

- 酒店主图最终存储为 URL 数组：`hotels.main_image_url`
- 房型图最终存储为 URL：`room_types.room_image_url`
- 接口响应以 URL 为主，避免返回大体积 base64（字段本身可能仍存在于表结构中，但业务路径以 URL 化为主）

补充：数据库脚本中包含与 base64 字段相关的迁移脚本（[migrate-hotel-image-base64.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/database/migrate-hotel-image-base64.js)）。

### 8.5 端口约定说明

图片 URL 里使用了 `http://localhost:3000/...`，这意味着图片访问端口取决于“提供静态资源的前端服务端口”。

- 若后端也运行在 3000（默认），需要通过 `.env` 调整后端 `PORT`，避免端口冲突
- 或者将图片 URL 的端口改为实际的前端静态服务端口（与部署方式一致）

## 9. 数据库与模型要点

### 9.1 Sequelize 连接

Sequelize 使用 `DATABASE_URL` 直连 Postgres，并关闭 SQL logging（[database.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/config/database.js)）。

### 9.2 主要实体与关联

模型统一在 [models/index.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/models/index.js) 汇总并建立关联，包括：

- 用户与扩展资料：`User` ↔ `UserProfile`
- 酒店及关联：
  - `Hotel` ↔ `HotelPolicy`
  - `Hotel` ↔ `RoomType` ↔ `RoomPrice/RoomPolicy/RoomFacility/RoomService/RoomTag`
  - `Hotel` ↔ `HotelFacility/HotelService`
  - `Hotel` ↔ `AuditLog/HotelHistory`
- 站内消息：`User` ↔ `Message`

## 10. 数据库脚本与测试方式

### 10.1 数据库脚本

项目提供初始化/重置脚本（[database](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/database)）：

- `npm run db:init`：初始化（[init-all.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/database/init-all.js)）
- `npm run db:reset`：重置（[reset-all.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/database/reset-all.js)）

### 10.2 接口测试

`src/tests/pc` 下包含大量基于 Node 内置 `http` 的接口调用脚本（例如 [create-hotel.test.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/tests/pc/create-hotel.test.js)、[jwt.test.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-backend/src/tests/pc/jwt.test.js)）。

这些脚本通常假设：

- 后端服务已在本机启动
- `.env` 配置正确（脚本会显式加载项目根目录 `.env`）
- 可通过 `node <test_file>` 的方式手动运行进行联调验证

---

# Yisu-Hotel PC 前端技术要点说明（Yisu-Hotel-PC）

本文基于目录 [Yisu-Hotel-PC](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC) 的现有实现整理，侧重说明：API 封装、Token 的存储与发送、各页面实现（商户端/管理员端）、高德地图选点配置与交互、以及主要页面效果与 UI 组织方式。

## 1. 项目概览与依赖

- 工程化：Create React App（react-scripts）（[package.json](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/package.json#L1-L28)）
- 视图层：React 19（[package.json](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/package.json#L5-L16)）
- 路由：react-router-dom v6（[app.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/app.js#L1-L66)）
- 数据请求与缓存：SWR（用于 profile/酒店汇总/消息等数据的缓存与去重）（[merchant/Overview.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Overview.jsx#L1-L77)）
- 样式：Tailwind CSS（暗色模式采用 `class` 策略，主题色为 `primary=#137fec`）（[tailwind.config.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/tailwind.config.js#L1-L23)、[index.css](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/index.css#L1-L13)）
- 地图：高德地图 JSAPI Loader（@amap/amap-jsapi-loader）（[package.json](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/package.json#L5-L16)、[merchant/CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx#L1-L220)）

## 2. 入口与路由组织（角色隔离）

入口渲染：

- [index.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/index.js#L1-L17) 通过 `ReactDOM.createRoot` 渲染 [App](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/app.js#L38-L66)

路由与访问控制：

- [app.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/app.js#L1-L66) 使用 `ProtectedRoute` 做角色准入：
  - 从 `localStorage` 读取 `token` 与 `user`（JSON），判断登录态与角色（[app.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/app.js#L6-L18)）
  - 允许角色不匹配时，重定向到对应角色入口（商户 `/merchant`，管理员 `/admin`）（[app.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/app.js#L20-L35)）
  - 路由入口：
    - `/login`、`/`：登录/注册/找回页（[LoginPage.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/auth/LoginPage.jsx)）
    - `/merchant`：商户控制台（[merchant/Overview.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Overview.jsx)）
    - `/admin`：管理员控制台（[admin/Overview.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/admin/Overview.jsx)）

## 3. API 封装（fetch + 统一 JSON 解析）

API 封装集中在 [api.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/utils/api.js)：

- 基础配置：
  - `API_BASE = 'http://localhost:5050'`（[api.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/utils/api.js#L1)）
  - `requestJson(path, options)`：基于 `fetch` 发送请求，并统一 `response.json()` 解析，返回 `{ response, result }`（[api.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/utils/api.js#L3-L7)）
- Token 请求头：
  - `buildHeaders(token, headers)`：若存在 token，注入 `Authorization: Bearer <token>`（[api.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/utils/api.js#L9-L14)）
- API 方法形态约定（两种）：
  - 直通返回 `{ response, result }`：由调用方自行判断 `result.code`（例如 `login/register/createHotel/updateHotel/sendChatCompletions`）（[api.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/utils/api.js#L40-L65)、[api.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/utils/api.js#L148-L183)）
  - 内部校验并 `throw new Error`：如果 `!response.ok` 或 `result.code !== 0`，直接抛错（例如 `fetchUserProfile/updateUserProfile/fetchHotelDetail/fetchAdminAuditList` 等）（[api.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/utils/api.js#L67-L125)、[api.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/utils/api.js#L185-L225)）

主要接口覆盖：

- 认证：`/auth/send-code`、`/auth/check-account`、`/auth/login`、`/auth/register`、`/auth/reset-password`（[api.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/utils/api.js#L16-L65)）
- 用户：`/user/profile`、`/user/messages`（[api.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/utils/api.js#L67-L89)、[api.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/utils/api.js#L166-L174)）
- 酒店（商户）：`/hotel/list`、`/hotel/detail/:id`、`/hotel/audit-status/:id`、`/hotel/create`、`/hotel/update/:id`、`/hotel/delete/:id`（[api.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/utils/api.js#L91-L165)）
- 酒店（管理员）：`/admin/hotel/audit-list`、`/admin/hotel/detail/:id`、`/admin/hotel/batch-audit`（[api.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/utils/api.js#L185-L225)）
- 智能助手：`/chat/completions`（[api.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/utils/api.js#L176-L183)）

## 4. Token 存储与发送（localStorage）

Token 与用户信息的存储位置：

- 登录/注册成功后写入：
  - `localStorage.setItem('token', token)`
  - `localStorage.setItem('user', JSON.stringify(user))`
  - 实现位置：[saveToken](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/auth/LoginPage.jsx#L17-L20)
- 退出登录清理：
  - 商户端（仅清 `token`）：[merchant/Overview.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Overview.jsx#L118-L122)
  - 管理员端（清 `token` + `user`）：[admin/Overview.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/admin/Overview.jsx#L66-L71)

Token 的发送方式：

- 调用 API 时通常在页面内即时读取 `localStorage.getItem('token')`，然后传入 API 方法（例如商户酒店列表、管理员审核等）（[merchant/Listings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Listings.jsx#L287-L329)、[admin/Audits.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/admin/Audits.jsx#L59-L103)）
- API 层通过 `buildHeaders` 统一拼装 `Authorization: Bearer <token>`（[api.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/utils/api.js#L9-L14)）

补充：登录页“记住我”会向后端传 `token_expires_in`（秒）以延长 token 过期时间（30 天）。（[LoginPage.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/auth/LoginPage.jsx#L199-L203)）

## 5. 高德地图配置与选点交互（CreateHotel）

地图选点集成在商户“创建/编辑酒店”页 [CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx)：

- 安全密钥配置：
  - 通过 `window._AMapSecurityConfig.securityJsCode` 设置安全密钥（[CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx#L5-L8)）
- JSAPI 加载：
  - `AMapLoader.load({ key, version:'2.0', plugins:['AMap.Geocoder','AMap.Marker'] })`（[CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx#L133-L139)）
- 交互方式：
  - 弹窗内渲染地图容器（`mapContainerRef`），初始化时优先使用已有坐标 `location_info.location` 作为中心点，否则默认北京（[CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx#L141-L155)）
  - Marker 支持拖拽；地图点击会移动 Marker（[CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx#L158-L177)）
  - 通过 `Geocoder.getAddress` 做逆地理编码，回填省市区街道门牌与 `formatted_address`（[CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx#L197-L220)）
  - 若已有地址但没有坐标，会用 `Geocoder.getLocation` 将地址转换为坐标并定位（[CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx#L179-L191)）
- 坐标字段约定：
  - `location_info.location` 存储为字符串 `"lng,lat"`（[CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx#L197-L200)）
  - 提交时会校验格式 `^-?\d+(\.\d+)?,-?\d+(\.\d+)?$`（[CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx#L460-L465)）

环境变量说明（以现有实现为准）：

- `process.env.VITE_AMAP_KEY`：高德 Key（[CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx#L135-L139)）
- `process.env.VITE_AMAP_SECURITY_CODE`：安全密钥（[CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx#L5-L8)）

当前项目构建工具为 CRA，默认仅暴露 `REACT_APP_*` 前缀环境变量；因此在未额外定制构建流程时，以上 `VITE_*` 变量通常会落到代码里的兜底值（硬编码 key）。

## 6. 酒店创建/编辑页（图片、房型、草稿/提交）

商户“新增/编辑酒店”由 [Listings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Listings.jsx#L511-L519) 切换渲染 [CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx)：

- 草稿与提交：
  - 保存草稿：`payload.save_as_draft = true`（[CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx#L487-L509)）
  - 正式提交：编辑模式强制 `save_as_draft=false`；新建模式直接创建（[CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx#L456-L485)）
- 图片字段组装（与后端“base64 落盘 + URL 化”方案对应）：
  - `hotelImages` 维护 `{ url, base64 }`，组装时把 dataURL 归入 `main_image_base64`，非 dataURL 归入 `main_image_url`（[CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx#L417-L434)）
  - 每个房型支持单张图（UI 侧），同样区分 `room_image_url` 与 `room_image_base64`（[CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx#L436-L450)）
- 房型与价格形态：
  - `payload.room_prices` 以“房型名”为 key 的对象（与后端中间件归一化逻辑保持一致）（[CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx#L433-L451)）
  - 批量定价会把日期区间写入 `room.prices['YYYY-MM-DD']=price`（[CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx#L391-L415)）

## 7. 页面实现概览（商户端）

商户端入口为 [merchant/Overview.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Overview.jsx)，通过 URL 查询参数控制 Tab：

- Tab 组织：`?tab=dashboard|listings|audits|settings`（[merchant/Overview.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Overview.jsx#L23-L24)、[merchant/Overview.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Overview.jsx#L304-L320)）
- 数据加载：
  - `fetchUserProfile`：用户资料（头像/昵称等）（[merchant/Overview.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Overview.jsx#L34-L37)）
  - `fetchAllHotels`：一次性拉取所有酒店（分页聚合）用于统计与预览（[merchant/Overview.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Overview.jsx#L39-L46)、[api.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/utils/api.js#L101-L115)）
  - `fetchMessages`：消息通知（仅在通知面板展开时才触发请求）（[merchant/Overview.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Overview.jsx#L48-L57)）

商户各功能页要点：

- 控制面板 [merchant/Dashboard.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Dashboard.jsx)
  - 酒店卡片列表 + Skeleton 加载态（[Dashboard.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Dashboard.jsx#L22-L35)、[Dashboard.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Dashboard.jsx#L77-L145)）
  - “查看详情”弹窗：调用 `/hotel/detail/:id` 并展示聚合字段（[Dashboard.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Dashboard.jsx#L330-L356)）
  - AI 助手侧栏：调用 `/chat/completions`，并将对话历史持久化到 `localStorage.merchant_chat_history`（[Dashboard.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Dashboard.jsx#L307-L328)、[Dashboard.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Dashboard.jsx#L374-L446)）
- 酒店列表 [merchant/Listings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Listings.jsx)
  - 拉取列表：会先请求第一页并并发拉取后续页，组装全量列表后在前端做筛选/搜索/分页（[Listings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Listings.jsx#L287-L334)、[Listings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Listings.jsx#L350-L379)）
  - 支持：状态筛选、关键字搜索（防抖 300ms）、列表分页（[Listings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Listings.jsx#L280-L339)、[Listings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Listings.jsx#L393-L398)）
  - 操作：编辑（拉详情并进入 CreateHotel）、查看详情弹窗、删除确认弹窗（[Listings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Listings.jsx#L436-L519)）
- 审核记录 [merchant/Audits.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Audits.jsx)
  - 仅展示状态为 `pending/published/rejected` 的酒店，并提供状态筛选与排序（[Audits.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Audits.jsx#L71-L105)）
  - 选中酒店后请求 `/hotel/audit-status/:id`，并使用本地 Map 做兜底缓存，降低重复请求（[Audits.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Audits.jsx#L57-L161)）
- 设置中心 [merchant/Settings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Settings.jsx)
  - 资料回显：`/user/profile`（[Settings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Settings.jsx#L23-L62)）
  - 头像上传：FileReader 转 dataURL，提交到 `avatar_base64`（[Settings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Settings.jsx#L74-L87)、[Settings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Settings.jsx#L100-L106)）
  - 提交成功后：更新本地 `user` 缓存，并触发 SWR `mutate(['profile', token])` 刷新（[Settings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Settings.jsx#L108-L137)）

## 8. 页面实现概览（管理员端）

管理员入口为 [admin/Overview.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/admin/Overview.jsx)：

- 会在页面挂载时做二次校验：若 token/user 缺失或角色不是 admin，会重定向（[admin/Overview.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/admin/Overview.jsx#L44-L52)）
- Tab 组织：`?tab=listings|audits|settings`（[admin/Overview.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/admin/Overview.jsx#L54-L58)、[admin/Overview.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/admin/Overview.jsx#L146-L150)）

管理员各功能页要点：

- 酒店上架管理 [admin/Listings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/admin/Listings.jsx)
  - 两个 Tab：已上线（`status=published`）与被下线（`status=rejected`），均通过 `/admin/hotel/audit-list` 获取（[admin/Listings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/admin/Listings.jsx#L4-L7)、[admin/Listings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/admin/Listings.jsx#L135-L177)）
  - 详情弹窗：`/admin/hotel/detail/:id`（[admin/Listings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/admin/Listings.jsx#L52-L77)）
  - 上下线动作：复用 `/admin/hotel/batch-audit`，上线使用 `status=published`，下线使用 `status=rejected + reject_reason`（[admin/Listings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/admin/Listings.jsx#L86-L110)、[admin/Listings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/admin/Listings.jsx#L190-L208)）
- 酒店审核 [admin/Audits.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/admin/Audits.jsx)
  - 拉取待审核列表：`/admin/hotel/audit-list?status=pending`（[admin/Audits.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/admin/Audits.jsx#L59-L95)）
  - 审核动作：通过 `/admin/hotel/batch-audit` 批量接口提交单个 hotel_id（通过 `published` / 驳回 `rejected + reject_reason`）（[admin/Audits.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/admin/Audits.jsx#L130-L163)）
  - 详情展示：选中酒店即请求 `/admin/hotel/detail/:id`（[admin/Audits.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/admin/Audits.jsx#L165-L203)）
- 设置中心：复用商户端设置页 [merchant/Settings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Settings.jsx)

## 9. 页面效果与 UI 实现要点

- Tailwind 暗色模式：配置为 `darkMode: 'class'`，组件大量使用 `dark:*` class，但页面初始化时普遍强制给 `documentElement` 加 `light` class（[tailwind.config.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/tailwind.config.js#L1-L23)、[merchant/Overview.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Overview.jsx#L26-L32)、[admin/Overview.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/admin/Overview.jsx#L36-L42)）
- 加载态与骨架屏：
  - 商户 Dashboard 使用 Skeleton 卡片（[Dashboard.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Dashboard.jsx#L22-L35)）
  - 商户/管理员列表页通常提供加载中提示或占位（例如 [merchant/Listings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Listings.jsx#L582-L598)）
- 弹窗与抽屉：
  - 详情弹窗：酒店详情（Dashboard/Listings/Admin Listings）与删除确认（商户 Listings）（[merchant/Listings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Listings.jsx#L72-L253)、[admin/Listings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/admin/Listings.jsx#L41-L51)）
  - AI 助手侧栏（抽屉式）：[merchant/Dashboard.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Dashboard.jsx#L478-L507)
  - 地图选点弹窗：CreateHotel（[CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx#L519-L549)）
- 图标：使用 Material Symbols（CSS 设置 `font-variation-settings`）（[index.css](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/index.css#L11-L13)）
- 轻量反馈：
  - 登录页与设置页使用 Toast/提示条（[LoginPage.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/auth/LoginPage.jsx#L124-L163)、[Settings.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/Settings.jsx#L139-L153)）
  - 多处表单提交使用 `alert(...)` 做结果反馈（例如 CreateHotel）（[CreateHotel.jsx](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/pages/merchant/CreateHotel.jsx#L456-L485)）

## 10. 联调端口与资源访问约定

- 前端开发服务器默认端口：3000（[README.md](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/README.md#L5-L13)）
- 前端请求后端端口：由 `API_BASE` 决定，当前为 `http://localhost:5050`（[api.js](file:///d:/github/Yisu-Hotel/PC/Yisu-Hotel-PC/src/utils/api.js#L1)）
- 图片静态资源：
  - 后端会将酒店图片落盘到前端 `public/main_image` 与 `public/room_image`，并以 `http://localhost:3000/...` URL 形式返回（见后端文档第 8 章）
  - 因此本地联调时通常需要：前端（3000）与后端（5050 或其他端口）同时启动，且注意避免后端占用 3000 导致静态资源无法访问
