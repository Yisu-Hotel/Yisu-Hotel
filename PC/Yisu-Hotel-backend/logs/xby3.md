# 易宿酒店后端实现日志（图片与删除规则、复杂接口说明）

## 图片上传与获取
- 输入约束
  - 创建酒店接口支持主图片 base64：`main_image_base64` 可为数组或单个字符串（中间件归一化为数组）
  - 每个房型支持单张房型图片 base64：`room_image_base64`（字符串）
  - 同时可传已有图片 URL：`main_image_url`（数组或字符串）、`room_image_url`（字符串）
- 存储策略
  - 主图片保存到磁盘目录：`d:\Yisu\Yisu-Hotel-PC\public\main_image\`
  - 房型图片保存到磁盘目录：`d:\Yisu\Yisu-Hotel-PC\public\room_image\`
  - URL 前缀：
    - 主图：`http://localhost:3000/main_image/<文件名>`
    - 房图：`http://localhost:3000/room_image/<文件名>`
  - 文件名规则：`<前缀>-<时间戳>-<随机>.扩展名`（支持 dataURL 与纯 base64，扩展名优先从 MIME 解析，默认 png）
  - 若写入失败返回 `null`，对应图片跳过
- 数据库与响应
  - 主图片仅保存 URL 数组到 `hotels.main_image_url`，不再保存 base64
  - 房型仅保存 `room_types.room_image_url`，不再保存 base64
  - 详情接口仅返回图片 URL（`main_image_url`、`room_prices.{房型}.room_image_url`），不返回 base64
- 相关实现位置
  - 服务层图片保存与 URL 生成：[services/pc/hotel.js](file:///d:/Yisu/Yisu-Hotel-backend/src/services/pc/hotel.js)
  - 创建输入归一化（数组/字符串、base64）：[middlewares/pc/hotel.js](file:///d:/Yisu/Yisu-Hotel-backend/src/middlewares/pc/hotel.js)
  - 详情数据组装与返回结构：[services/pc/hotel.js](file:///d:/Yisu/Yisu-Hotel-backend/src/services/pc/hotel.js)

## 删除酒店规则
- 权限校验：仅酒店创建者可删除（`created_by === userId`），否则返回 4011
- 状态限制：仅 `draft` 与 `rejected` 状态允许删除；其它状态（如 `pending`/`approved`）返回 4012
- 不存在：酒店不存在返回 4010
- 成功响应：`{ code: 0, msg: '删除成功', data: null }`
- 相关实现位置
  - 控制器删除接口：[controllers/pc/hotel.js](file:///d:/Yisu/Yisu-Hotel-backend/src/controllers/pc/hotel.js)
  - 服务层删除逻辑与规则：[services/pc/hotel.js](file:///d:/Yisu/Yisu-Hotel-backend/src/services/pc/hotel.js)
  - 路由绑定：`DELETE /hotel/delete/:id` [routes/pc/hotel.js](file:///d:/Yisu/Yisu-Hotel-backend/src/routes/pc/hotel.js)

## 控制器复杂接口
- 创建酒店 `POST /hotel/create`
  - 从中间件取得规整后的 `req.hotelPayload`
  - 解析 `save_as_draft` 支持 `true/'true'/1/'1'`，决定草稿与待审核状态
  - 调用服务层创建（主图/房图 base64 写盘、URL 保存、政策/设施/服务/房型/价格入库）
  - 响应：草稿返回“草稿已保存”，非草稿返回“酒店信息创建成功，等待审核”
  - 位置：[controllers/pc/hotel.js](file:///d:/Yisu/Yisu-Hotel-backend/src/controllers/pc/hotel.js)
- 获取酒店列表 `GET /hotel/list`
  - 支持分页与状态筛选、关键词搜索（名称/地址）
  - 返回统计字段：收藏数、平均评分、预订数、点评数
  - 位置：[controllers/pc/hotel.js](file:///d:/Yisu/Yisu-Hotel-backend/src/controllers/pc/hotel.js)
- 获取酒店详情 `GET /hotel/detail/:id`
  - 限定只查当前用户创建的酒店
  - 级联加载政策、设施/服务、房型（设施/服务/标签/政策/逐日价格）
  - 组装 `room_prices` 为“房型名 => 房型详情”的对象映射（含价格字典）
  - 仅返回图片 URL，不返回 base64
  - 位置：[controllers/pc/hotel.js](file:///d:/Yisu/Yisu-Hotel-backend/src/controllers/pc/hotel.js)、[services/pc/hotel.js](file:///d:/Yisu/Yisu-Hotel-backend/src/services/pc/hotel.js)
- 删除酒店 `DELETE /hotel/delete/:id`
  - 依赖服务层执行权限与状态校验，成功后删除
  - 位置：[controllers/pc/hotel.js](file:///d:/Yisu/Yisu-Hotel-backend/src/controllers/pc/hotel.js)

## 中间件与路由
- 中间件
  - 创建参数校验与归一化（房型结构、价格日期/金额、政策映射、图片字段归一化）：[middlewares/pc/hotel.js](file:///d:/Yisu/Yisu-Hotel-backend/src/middlewares/pc/hotel.js)
  - 详情与删除参数校验（UUID 格式校验，设置 `req.hotelId`）：[middlewares/pc/hotel.js](file:///d:/Yisu/Yisu-Hotel-backend/src/middlewares/pc/hotel.js)
- 路由
  - `POST /hotel/create`、`GET /hotel/list`、`GET /hotel/detail/:id`、`DELETE /hotel/delete/:id`：[routes/pc/hotel.js](file:///d:/Yisu/Yisu-Hotel-backend/src/routes/pc/hotel.js)

## 前端调用与交互补充
- 详情弹窗：支持垂直滚动，统一在 Dashboard 与 Listings 中展示，调用 `/hotel/detail/:id` 拉取数据
  - [Dashboard.jsx](file:///d:/Yisu/Yisu-Hotel-PC/src/pages/overview/Dashboard.jsx)
  - [Listings.jsx](file:///d:/Yisu/Yisu-Hotel-PC/src/pages/overview/Listings.jsx)
- 删除确认弹窗：Listings 页面“删除”按钮先弹窗确认，确认后调用 `DELETE /hotel/delete/:id`
  - [Listings.jsx](file:///d:/Yisu/Yisu-Hotel-PC/src/pages/overview/Listings.jsx)

## 测试脚本
- 创建酒店测试：五种房型、三张主图、每房型一张图片，均使用统一 base64 文件
  - [create-hotel.test.js](file:///d:/Yisu/Yisu-Hotel-backend/src/tests/pc/create-hotel.test.js)
- 删除酒店测试：创建草稿后删除，重复删除验证错误码
  - [delete-hotel.test.js](file:///d:/Yisu/Yisu-Hotel-backend/src/tests/pc/delete-hotel.test.js)
