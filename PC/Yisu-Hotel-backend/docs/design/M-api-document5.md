# 手机端 API 接口文档 - 预订确认页和支付页

## 目录

- [基础信息](#基础信息)
- [预订确认页API](#预订确认页API)
- [错误码](#错误码)

## 1. 基础信息

- 基础URL: `http://localhost:{PORT}`
- 认证方式: Bearer Token（所有接口需在请求头中携带 `Authorization: Bearer {token}`）
- 字符集: UTF-8
- 时区: UTC

## 2. 预订确认页API

### 2.1 获取预订信息

**接口地址:** `GET /mobile/bookings/confirm/{booking_token}`

**描述:** 获取预订确认页所需的完整信息，包括酒店详情、房型信息、价格明细等

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| booking_token | string | 是 | 预订令牌（从酒店详情页传递） |

**请求头:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer {token} |

**响应示例:**
```json
{
  "code": 0,
  "msg": "获取成功",
  "data": {
    "booking_id": "booking_001",
    "hotel_id": "hotel_001",
    "hotel_name": "易宿酒店",
    "room_type": "豪华大床房",
    "check_in": "2026-02-01",
    "check_out": "2026-02-02",
    "price": {
      "total": 399,
      "original_total": 499,
      "discount": 100,
      "currency": "CNY"
    },
    "contact_info": {
      "name": "张三",
      "phone": "13800138000"
    },
    "location_info": {
      "formatted_address": "北京市朝阳区阜通东大街6号",
      "country": "中国",
      "province": "北京市",
      "city": "北京市",
      "district": "朝阳区",
      "street": "阜通东大街",
      "number": "6号",
      "location": "116.482086,39.990496"
    },
    "created_at": "2026-01-20T10:30:00Z"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| booking_id | string | 预订ID |
| hotel_id | string | 酒店ID |
| hotel_name | string | 酒店名称 |
| room_type | string | 房型名称 |
| check_in | string | 入住日期 |
| check_out | string | 离店日期 |
| price | object | 价格信息 |
| price.total | number | 总价 |
| price.original_total | number | 原价 |
| price.discount | number | 折扣金额 |
| price.currency | string | 货币类型 |
| contact_info | object | 联系人信息 |
| contact_info.name | string | 联系人姓名 |
| contact_info.phone | string | 联系人电话 |
| location_info | object | 位置信息 |
| location_info.formatted_address | string | 格式化地址 |
| location_info.country | string | 国家 |
| location_info.province | string | 省份 |
| location_info.city | string | 城市 |
| location_info.district | string | 区 |
| location_info.street | string | 街道 |
| location_info.number | string | 门牌号 |
| location_info.location | string | 经纬度坐标 |
| created_at | string | 创建时间 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权，请先登录 |
| 4006 | 酒店不存在 |
| 4010 | 房型不存在 |
| 4018 | 预订令牌无效或已过期 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/mobile/bookings/confirm/booking_123456" \
  -H "Authorization: Bearer {token}"
```

---

### 2.2 提交预订订单

**接口地址:** `POST /mobile/bookings/submit`

**描述:** 提交预订订单并进入支付流程

**请求参数:** 无

**请求头:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer {token} |
| Content-Type | string | 是 | application/json |

**请求体:**
```json
{
  "booking_token": "booking_123456",
  "guest_info": {
    "name": "张三",
    "phone": "13800138000"
  },
  "agreed": true
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| booking_token | string | 是 | 预订令牌 |
| guest_info | object | 是 | 入住人信息 |
| guest_info.name | string | 是 | 入住人姓名 |
| guest_info.phone | string | 是 | 入住人手机号 |
| agreed | boolean | 是 | 是否已同意协议 |

**响应示例:**
```json
{
  "code": 0,
  "msg": "提交成功",
  "data": {
    "booking_id": "booking_001",
    "order_number": "YS202602010001",
    "total_amount": 284,
    "payment_url": "/mobile/payments/booking_001",
    "payment_expire": 900,
    "message": "订单提交成功，请在15分钟内完成支付"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| booking_id | string | 预订ID |
| order_number | string | 订单编号 |
| total_amount | number | 总金额 |
| payment_url | string | 支付页面URL |
| payment_expire | number | 支付过期时间（秒） |
| message | string | 提示信息 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权，请先登录 |
| 400 | 请求参数错误 |
| 4018 | 预订令牌无效或已过期 |
| 4019 | 未同意协议 |
| 4012 | 预订失败，请稍后重试 |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/mobile/bookings/submit" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"booking_token": "booking_123456", "guest_info": {"name": "张三", "phone": "13800138000"}, "agreed": true}'
```

---

