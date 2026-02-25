# Yisu Hotel 移动端 优惠券模块接口文档

本文档详细描述了移动端用户优惠券管理相关的 API 接口，包括获取优惠券列表及获取优惠券详情。

## 目录

- [1.基础信息](#1基础信息)
- [2.API 端点](#2api-端点)
  - [2.1 获取优惠券列表](#21-获取优惠券列表)
  - [2.2 获取优惠券详情](#22-获取优惠券详情)
  - [2.3 领取优惠券](#23-领取优惠券)
  - [2.4 使用优惠券](#24-使用优惠券)

## 1.基础信息

- **基础URL**: `http://localhost:{PORT}/api/mobile/coupon`
- **数据格式**: `application/json`
- **鉴权**: 所有接口均需要 `Authorization` Header，值为 `Bearer <token>`。

## 2.API 端点

---

### 2.1 获取优惠券列表

**接口地址:** `GET /list`

**描述:** 根据优惠券状态分页查询当前登录用户的优惠券列表。

**后端自动处理逻辑说明:**
1. **鉴权解析**: 解析请求头中的 `Authorization` Token，提取当前登录用户的 `user_id`。
2. **条件构造**:
   - 必选条件：`user_id` 匹配。
   - 可选条件：若传入 `status`，则增加状态过滤（可用、已使用、已过期）。
3. **分页处理**: 结合 `page` 和 `pageSize` 参数，从 `user_coupons` 表中查询数据，通常按 `valid_until`（过期时间）降序排列。

**请求头:**
```yaml
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数 (Query):**
| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| status | string | 否 | 优惠券状态: `available` (可用), `used` (已使用), `expired` (已过期) | "available" |
| page | number | 否 | 页码，默认为 1 | 1 |
| pageSize | number | 否 | 每页记录数，默认为 10 | 10 |

**请求示例:**
```bash
curl -X GET "http://localhost:{PORT}/api/mobile/coupon/list?status=available&page=1&pageSize=10" \
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
        "id": "user-coupon-uuid...",
        "title": "新用户专享满减券",
        "discount_type": "fixed",
        "discount_value": 50.00,
        "min_order_amount": 200.00,
        "valid_from": "2026-02-01",
        "valid_until": "2026-03-01",
        "is_new_user_only": true,
        "status": "available"
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
| data.list | array | 优惠券列表 |
| data.list[].id | string | 用户优惠券关联 ID |
| data.list[].title | string | 优惠券标题 |
| data.list[].discount_type | string | 优惠类型: `fixed` (固定金额), `percentage` (百分比) |
| data.list[].discount_value | number | 优惠值 |
| data.list[].min_order_amount | number | 最低使用金额 |
| data.list[].valid_from | string | 有效期开始日期 |
| data.list[].valid_until | string | 有效期结束日期 |
| data.list[].is_new_user_only | boolean | 是否仅限新用户 |
| data.list[].status | string | 状态: `available`, `used`, `expired` |
| data.total | number | 总记录数 |
| data.page | number | 当前页码 |
| data.pageSize | number | 每页记录数 |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 请求成功 |
| 4008 | Token 无效或已过期 |
| 500 | 服务器内部错误 |

---

### 2.2 获取优惠券详情

**接口地址:** `GET /detail`

**描述:** 根据优惠券 ID 获取该优惠券的详细定义及关联的订单使用信息（如已使用）。

**后端自动处理逻辑说明:**
1. **身份校验**: 验证该优惠券记录是否属于当前登录用户（基于 `user_id`）。
2. **数据关联**: 
   - 基础数据：关联 `coupons` 模板表获取标题、描述、规则等。
   - 订单快照（仅限 `status == 'used'`）：若优惠券已使用，则通过 `booking_id` 关联 `bookings` 表和 `hotels` 表，获取该优惠券核销时的订单详情（酒店名、房型、实付金额等）。

**请求头:**
```yaml
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数 (Query):**
| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| id | string | 是 | 用户优惠券关联 ID (UUID) | "user-coupon-uuid..." |

**请求示例:**
```bash
curl -X GET "http://localhost:{PORT}/api/mobile/coupon/detail?id=user-coupon-uuid..." \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

**响应示例 (包含订单信息):**
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "id": "user-coupon-uuid...",
    "title": "新用户专享满减券",
    "description": "仅限移动端新注册用户使用",
    "discount_type": "fixed",
    "discount_value": 50.00,
    "min_order_amount": 200.00,
    "valid_from": "2026-02-01",
    "valid_until": "2026-03-01",
    "is_new_user_only": true,
    "rules": "1. 每人限领一张；2. 不可与其他优惠叠用。",
    "status": "used",
    "booking_info": {
      "booking_id": "booking-uuid...",
      "order_number": "BK202602130001",
      "hotel_name": "示例豪华酒店",
      "room_type_name": "豪华大床房",
      "check_in_date": "2026-02-20",
      "check_out_date": "2026-02-22",
      "total_price": 1280.00,
      "status": "paid",
      "booked_at": "2026-02-13T10:00:00.000Z"
    }
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data.id | string | 用户优惠券关联 ID |
| data.title | string | 标题 |
| data.description | string | 描述 |
| data.discount_type | string | 优惠类型 |
| data.discount_value | number | 优惠值 |
| data.min_order_amount | number | 最低使用金额 |
| data.valid_from | string | 有效期起 |
| data.valid_until | string | 有效期止 |
| data.is_new_user_only | boolean | 仅限新用户 |
| data.rules | string | 规则详情 |
| data.status | string | 状态 |
| data.booking_info | object | 关联订单信息（若 status 为 used 则存在） |
| data.booking_info.booking_id | string | 订单ID |
| data.booking_info.order_number | string | 订单号 |
| data.booking_info.hotel_name | string | 酒店名称 |
| data.booking_info.room_type_name | string | 房型名称 |
| data.booking_info.check_in_date | string | 入住日期 |
| data.booking_info.check_out_date | string | 离店日期 |
| data.booking_info.total_price | number | 订单总价 |
| data.booking_info.status | string | 订单状态 |
| data.booking_info.booked_at | string | 预订时间 |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 请求成功 |
| 4008 | Token 无效或已过期 |
| 4014 | 优惠券记录不存在 |
| 500 | 服务器内部错误 |

---

### 2.3 领取优惠券

**接口地址:** `POST /claim`

**描述:** 用户领取指定的优惠券。系统将在 `UserCoupon` 表中创建关联记录，初始状态设为 `available`。

**后端自动处理逻辑说明:**
1. **资格检查**:
   - 检查优惠券模板 (`coupons` 表) 是否存在且处于发放期内。
   - 检查库存是否充足（若设有总量限制）。
2. **重复领取校验**: 检查该用户是否已经领取过此优惠券（针对“每人限领一张”的规则）。
3. **记录创建**: 在 `user_coupons` 表中插入记录，状态设为 `available`，并记录领取时间 `claimed_at`。

**请求头:**
```yaml
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数 (Body):**
| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| coupon_id | string | 是 | 优惠券模板 ID (UUID) | "coupon-template-uuid..." |

**请求示例:**
```bash
curl -X POST http://localhost:{PORT}/api/mobile/coupon/claim \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "coupon_id": "coupon-template-uuid..."
  }'
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "领取成功",
  "data": {
    "id": "user-coupon-uuid...",
    "coupon_id": "coupon-template-uuid...",
    "status": "available",
    "claimed_at": "2026-02-13T12:00:00.000Z"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data.id | string | 用户优惠券关联记录 ID |
| data.coupon_id | string | 优惠券模板 ID |
| data.status | string | 初始状态: `available` |
| data.claimed_at | string | 领取时间 |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 请求成功 |
| 4008 | Token 无效或已过期 |
| 4015 | 优惠券已领完或不在发放期 |
| 4016 | 您已领取过该优惠券 |
| 500 | 服务器内部错误 |

---

### 2.4 使用优惠券

**接口地址:** `POST /use`

**描述:** 用户在支付订单时选择并使用一张有效的优惠券。后端将执行事务操作，同步更新用户优惠券状态、优惠券核销计数及订单价格信息。

**后端自动处理逻辑说明:**
- **UserCoupon 表**: 将对应记录的 `status` 更新为 `used`，并记录关联的 `booking_id`。
- **Coupon 表**: 增加对应优惠券模板的已使用次数计数（核销数）。
- **Booking 表**: 
    - 自动计算并更新 `discount_amount`（根据优惠券定义的固定金额或比例）。
    - 重新计算并更新 `total_price`（实付总额 = 原价 - 优惠额）。
    - 将 `coupon_id`（模板ID）记录到订单的优惠信息字段中。

**请求头:**
```yaml
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数 (Body):**
| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| coupon_id | string | 是 | 用户优惠券关联 ID (UUID)，对应 `UserCoupon` 表中的 `id` | "user-coupon-uuid..." |
| booking_id | string | 是 | 关联的订单 ID (UUID) | "booking-uuid..." |

**请求示例:**
```bash
curl -X POST http://localhost:{PORT}/api/mobile/coupon/use \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "coupon_id": "user-coupon-uuid...",
    "booking_id": "booking-uuid..."
  }'
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "优惠券使用成功",
  "data": {
    "booking_id": "booking-uuid...",
    "original_total_price": 1500.00,
    "discount_amount": 50.00,
    "final_total_price": 1450.00,
    "status": "used"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data.booking_id | string | 关联的订单 ID |
| data.original_total_price | number | 订单原价 |
| data.discount_amount | number | 优惠抵扣金额 |
| data.final_total_price | number | 优惠后最终应付金额 |
| data.status | string | 优惠券核销后的状态: `used` |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 请求成功 |
| 4008 | Token 无效或已过期 |
| 4014 | 优惠券记录不存在或不属于当前用户 |
| 4017 | 优惠券已使用或已过期 |
| 4018 | 订单状态不支持使用优惠券（如已支付或已取消） |
| 4019 | 订单金额未达到优惠券最低使用门槛 |
| 500 | 服务器内部错误 |
