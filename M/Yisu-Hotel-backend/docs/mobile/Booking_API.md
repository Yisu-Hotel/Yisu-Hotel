# Yisu Hotel 移动端 订单模块接口文档

本文档详细描述了移动端用户订单管理相关的 API 接口，包括订单列表查询和订单详情查询。

## 目录

- [1.基础信息](#1基础信息)
- [2.API 端点](#2api-端点)
  - [2.1 查询订单列表](#21-查询订单列表)
  - [2.2 查询订单详情](#22-查询订单详情)
  - [2.3 创建订单](#23-创建订单)
  - [2.4 支付订单](#24-支付订单)
  - [2.5 取消订单](#25-取消订单)

## 1.基础信息

- **基础URL**: `http://localhost:{PORT}/api/mobile/booking`
- **数据格式**: `application/json`
- **鉴权**: 所有接口均需要 `Authorization` Header，值为 `Bearer <token>`。

## 2.API 端点

---

### 2.1 查询订单列表

**接口地址:** `GET /list`

**描述:** 根据订单状态分页查询当前登录用户的订单列表。

**后端自动处理逻辑说明:**
1. **鉴权解析**: 后端解析请求头中的 `Authorization` Token，提取当前登录用户的 `user_id`。
2. **条件构造**:
   - 若 `status` 参数非空：在数据库查询条件中增加 `user_id` 和 `status` 过滤。
   - 若 `status` 参数为空或未传：仅根据 `user_id` 查询该用户下的**所有**订单记录。
3. **分页与排序**: 结合 `page` 和 `pageSize` 进行数据库分页查询，通常按 `booked_at`（下单时间）降序排列。

**请求头:**
```yaml
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数 (Query):**
| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| status | string | 否 | 订单状态: `pending` (待付款), `paid` (已付款), `completed` (已完成), `cancelled` (已取消) | "pending" |
| page | number | 否 | 页码，默认为 1 | 1 |
| pageSize | number | 否 | 每页记录数，默认为 10 | 10 |

**请求示例:**
```bash
curl -X GET "http://localhost:{PORT}/api/mobile/booking/list?status=pending&page=1&pageSize=10" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "list": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "order_number": "BK202602130001",
        "hotel_name": "示例豪华酒店",
        "room_type_name": "豪华大床房",
        "check_in_date": "2026-02-20",
        "check_out_date": "2026-02-22",
        "total_price": 1280.00,
        "status": "pending",
        "booked_at": "2026-02-13T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data.list | array | 订单列表 |
| data.list[].id | string | 订单ID |
| data.list[].order_number | string | 订单号 |
| data.list[].hotel_name | string | 酒店名称 |
| data.list[].room_type_name | string | 房型名称 |
| data.list[].check_in_date | string | 入住日期 |
| data.list[].check_out_date | string | 离店日期 |
| data.list[].total_price | number | 总价 |
| data.list[].status | string | 状态 |
| data.list[].booked_at | string | 预订时间 |
| data.total | number | 总记录数 |
| data.page | number | 当前页码 |
| data.pageSize | number | 每页记录数 |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 请求成功 |
| 4008 | Token 无效或已过期 |
| 500 | 服务器内部错误 |

注：status为空则获取所有状态的订单

---

### 2.2 查询订单详情

**接口地址:** `GET /detail`

**描述:** 根据订单 ID 获取该订单的所有相关详细数据。

**后端自动处理逻辑说明:**
1. **鉴权解析**: 解析 Token 提取 `user_id`。
2. **所有权校验**: 根据 `order_id` 查询订单，并验证该订单的 `user_id` 是否与当前 Token 中的用户 ID 一致，防止越权访问。
3. **数据组装**: 关联查询酒店表、房型表，获取最新的位置信息、图片及描述等快照数据并返回。

**请求头:**
```yaml
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数 (Query):**
| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| order_id | string | 是 | 订单唯一 ID (UUID) | "550e8400-e29b-41d4-a716-446655440000" |

**请求示例:**
```bash
curl -X GET "http://localhost:{PORT}/api/mobile/booking/detail?order_id=550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "order_number": "BK202602130001",
    "user_id": "user-uuid...",
    "hotel_id": "hotel-uuid...",
    "hotel_name": "示例豪华酒店",
    "room_type_id": "room-uuid...",
    "room_type_name": "豪华大床房",
    "check_in_date": "2026-02-20",
    "check_out_date": "2026-02-22",
    "total_price": 1280.00,
    "original_total_price": 1500.00,
    "discount_amount": 220.00,
    "currency": "CNY",
    "status": "pending",
    "contact_name": "张三",
    "contact_phone": "13800138000",
    "special_requests": "需要无烟房",
    "location_info": {
      "city": "杭州",
      "number": "56号",
      "street": "白羊街道",
      "country": "中国",
      "district": "钱塘区",
      "location": "100,100",
      "province": "浙江",
      "formatted_address": "中国浙江杭州钱塘区白羊街道56号"
    },
    "booked_at": "2026-02-13T10:00:00.000Z",
    "paid_at": null
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data.id | string | 订单ID |
| data.order_number | string | 订单号 |
| data.hotel_id | string | 酒店ID |
| data.hotel_name | string | 酒店名称 |
| data.room_type_id | string | 房型ID |
| data.room_type_name | string | 房型名称 |
| data.check_in_date | string | 入住日期 |
| data.check_out_date | string | 离店日期 |
| data.total_price | number | 总支付金额 |
| data.original_total_price | number | 原价 |
| data.discount_amount | number | 优惠金额 |
| data.currency | string | 货币单位 |
| data.status | string | 状态 |
| data.contact_name | string | 联系人姓名 |
| data.contact_phone | string | 联系人电话 |
| data.special_requests | string | 特殊要求 |
| data.location_info | object | 酒店位置信息快照 |
| data.booked_at | string | 预订时间 |
| data.paid_at | string | 支付时间 |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 请求成功 |
| 4008 | Token 无效或已过期 |
| 4010 | 订单不存在 |
| 500 | 服务器内部错误 |

---

### 2.3 创建订单

**接口地址:** `POST /create`

**描述:** 用户选择房型并确认日期后提交订单。后端将根据 `hotel_id` 和 `room_type_id` 自动查询并补充酒店名称、房型名称、当前价格、位置信息快照等，生成唯一的订单号及预订 Token。

**后端自动处理逻辑说明:**
1. **数据准备**: 
   - 从 Token 中提取 `user_id`。
   - 根据请求中的 `hotel_id` 和 `room_type_id` 从数据库中获取酒店名称、房型名称、基础价格及地理位置快照。
3. **计算价格**: 前端传递日期，后端根据房型单价 × 间夜数计算 `total_price`和`original_total_price`（一样）。
4. **订单持久化**: 向 `bookings` 表插入新记录，状态设为 `pending`，并填充上述所有关联信息。
5. **生成 Booking Token**: 
   - **方案建议**: 为确保支付环节的安全，后端会生成一个短效的加密字符串（或 JWT）。该 Token 内部包含 `order_id`。
   - **目的**: 支付接口接收到此 Token 后可验证支付请求是否针对该订单且金额未被篡改。
6. **响应**: 返回 `order_id` 和 `booking_token` 供前端跳转支付。

**请求头:**
```yaml
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数 (Body):**
| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| hotel_id | string | 是 | 酒店 ID (UUID) | "hotel-uuid..." |
| room_type_id | string | 是 | 房型 ID (UUID) | "room-uuid..." |
| check_in_date | string | 是 | 入住日期 (YYYY-MM-DD) | "2026-02-20" |
| check_out_date | string | 是 | 离店日期 (YYYY-MM-DD) | "2026-02-22" |
| special_requests | string | 否 | 特殊要求备注 | "需要高楼层，无烟房" |

**请求示例:**
```bash
curl -X POST http://localhost:{PORT}/api/mobile/booking/create \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "hotel_id": "hotel-uuid...",
    "room_type_id": "room-uuid...",
    "check_in_date": "2026-02-20",
    "check_out_date": "2026-02-22",
    "special_requests": "尽量安静的房间"
  }'
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "订单创建成功",
  "data": {
    "order_id": "550e8400-e29b-41d4-a716-446655440000",
    "order_number": "BK202602130001",
    "total_price": 1280.00,
    "status": "pending",
    "booking_token": "jwt-style-token-for-payment...",
    "booked_at": "2026-02-13T10:00:00.000Z"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data.order_id | string | 订单唯一 ID (UUID) |
| data.order_number | string | 系统生成的业务订单号 |
| data.total_price | number | 订单最终支付总额（不含优惠） |
| data.status | string | 订单初始状态，固定为 `pending` (待支付) |
| data.booking_token | string | 用于后续支付校验的临时凭证 |
| data.booked_at | string | 订单创建时间 |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 请求成功 |
| 4008 | Token 无效或已过期 |
| 4009 | 参数格式错误（如日期非法） |
| 4011 | 所选房型在指定日期内已无库存 |
| 4012 | 酒店或房型信息不存在 |
| 500 | 服务器内部错误 |

---

### 2.4 支付订单

**接口地址:** `POST /pay`

**描述:** 用户对状态为 `pending` 的订单进行支付操作。支付成功后，后端将自动更新订单状态为 `paid` 并记录当前的支付时间 `paid_at`。

**后端自动处理逻辑说明:**
- **状态更新**: 将 `Booking` 表中对应 `order_id` 的记录 `status` 字段修改为 `paid`。
- **时间记录**: 将当前系统时间写入 `paid_at` 字段。
- **权限校验**: 仅允许订单所属用户本人操作，且订单当前状态必须为 `pending`。

**请求头:**
```yaml
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数 (Body):**
| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| order_id | string | 是 | 订单唯一 ID (UUID) | "550e8400-e29b-41d4-a716-446655440000" |

**请求示例:**
```bash
curl -X POST http://localhost:{PORT}/api/mobile/booking/pay \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "支付成功",
  "data": {
    "order_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "paid",
    "paid_at": "2026-02-13T11:30:00.000Z"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data.order_id | string | 订单唯一 ID (UUID) |
| data.status | string | 更新后的订单状态，固定为 `paid` |
| data.paid_at | string | 系统记录的支付完成时间 |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 请求成功 |
| 4008 | Token 无效或已过期 |
| 4010 | 订单不存在 |
| 4013 | 订单当前状态不可支付（如已支付、已取消） |
| 500 | 服务器内部错误 |

---

### 2.5 取消订单

**接口地址:** `POST /cancel`

**描述:** 用户取消尚未完成的订单。后端将验证订单状态，并将其 `status` 修改为 `cancelled`。

**后端自动处理逻辑说明:**
- **状态更新**: 将 `Booking` 表中对应 `order_id` 的记录 `status` 字段修改为 `cancelled`。
- **权限校验**: 仅允许订单所属用户本人操作。
- **状态校验**: 仅 `pending`（待支付）或 `paid`（已支付，视具体退款政策而定）状态的订单可执行取消操作。

**请求头:**
```yaml
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数 (Body):**
| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| order_id | string | 是 | 订单唯一 ID (UUID) | "550e8400-e29b-41d4-a716-446655440000" |

**请求示例:**
```bash
curl -X POST http://localhost:{PORT}/api/mobile/booking/cancel \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "订单已取消",
  "data": {
    "order_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "cancelled"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data.order_id | string | 订单唯一 ID (UUID) |
| data.status | string | 更新后的订单状态，固定为 `cancelled` |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 请求成功 |
| 4008 | Token 无效或已过期 |
| 4010 | 订单不存在 |
| 4020 | 订单当前状态不可取消 |
| 500 | 服务器内部错误 |
