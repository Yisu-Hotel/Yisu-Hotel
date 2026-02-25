# 手机端 API 接口文档 - 酒店详情页

## 目录

- [基础信息](#基础信息)
- [酒店信息管理](#酒店信息管理)
- [日历和价格管理](#日历和价格管理)
- [房型管理](#房型管理)
- [预订管理](#预订管理)
- [收藏和分享](#收藏和分享)
- [错误码](#错误码)

## 1. 基础信息

- 基础URL: `http://localhost:{PORT}`
- 认证方式: Bearer Token（所有接口需在请求头中携带 `Authorization: Bearer {token}`）
- 字符集: UTF-8
- 时区: UTC

## 2. 酒店信息管理

### 2.1 获取酒店详情

**接口地址:** `GET /mobile/hotels/{hotel_id}/detail`

**描述:** 获取酒店详细信息（包含基础信息、设施、服务等）

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| hotel_id | string | 是 | 酒店ID |
| check_in | string | 否 | 入住日期（YYYY-MM-DD） |
| check_out | string | 否 | 离店日期（YYYY-MM-DD） |

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
    "hotel_id": "hotel_001",
    "hotel_name": "易宿酒店",
    "hotel_name_en": "Yisu Hotel",
    "star_rating": 4,
    "rating": 4.5,
    "review_count": 1234,
    "description": "易宿酒店位于北京市朝阳区核心地段，交通便利，周边配套设施齐全。酒店拥有舒适的客房和完善的服务设施，是商务出行和休闲旅游的理想选择。",
    "phone": "010-12345678",
    "opening_date": "2020-01-01",
    "nearby_info": "距离地铁站500米，周边有商场、餐厅",
    "facilities": [
      {"id": "wifi", "name": "免费WiFi"},
      {"id": "parking", "name": "免费停车场"},
      {"id": "air_conditioner", "name": "空调"},
      {"id": "tv", "name": "电视"},
      {"id": "breakfast", "name": "早餐"},
      {"id": "gym", "name": "健身房"}
    ],
    "services": [
      {"id": "reception", "name": "24小时前台"},
      {"id": "luggage", "name": "行李寄存"},
      {"id": "laundry", "name": "洗衣服务"},
      {"id": "taxi", "name": "叫车服务"},
      {"id": "concierge", "name": "concierge服务"}
    ],
    "policies": {
      "cancellation": "入住前24小时可免费取消",
      "payment": "支持现金、信用卡、移动支付",
      "children": "12岁以下儿童可免费入住",
      "pets": "不允许携带宠物"
    },
    "is_favorite": false,
    "favorite_count": 567,
    "room_prices": {
      "大床房": {
        "bed_type": "king",
        "area": 35,
        "description": "豪华大床房，配备舒适的大床，适合情侣或独自出行。房间宽敞明亮，装修现代，设施齐全。",
        "facilities": [
          {"id": "free_wifi", "name": "免费WiFi"},
          {"id": "air_conditioner", "name": "空调"},
          {"id": "tv", "name": "平板电视"},
          {"id": "minibar", "name": "迷你吧"},
          {"id": "bathtub", "name": "浴缸"},
          {"id": "workdesk", "name": "办公桌"}
        ],
        "room_image_url": "https://example.com/room1.jpg",
        "policies": {
          "cancellation": "入住前48小时可免费取消",
          "payment": "支持现金、信用卡、移动支付",
          "children": "12岁以下儿童可免费入住",
          "pets": "不允许携带宠物"
        },
        "tags": ["受欢迎", "豪华", "性价比高"],
        "services": [
          {"id": "airport_transfer", "name": "机场接送服务"},
          {"id": "laundry", "name": "洗衣服务"},
          {"id": "room_service", "name": "24小时客房服务"}
        ],
        "prices": {
          "2026-02-01": 299.00,
          "2026-02-02": 299.00,
          "2026-02-03": 399.00
        }
      },
      "双床房": {
        "bed_type": "twin",
        "area": 40,
        "description": "舒适双床房，配备两张单人床，适合朋友或商务出行。房间布局合理，采光良好。",
        "facilities": [
          {"id": "free_wifi", "name": "免费WiFi"},
          {"id": "air_conditioner", "name": "空调"},
          {"id": "tv", "name": "平板电视"},
          {"id": "minibar", "name": "迷你吧"},
          {"id": "workdesk", "name": "办公桌"}
        ],
        "room_image_url": "https://example.com/room2.jpg",
        "policies": {
          "cancellation": "入住前48小时可免费取消",
          "payment": "支持现金、信用卡、移动支付",
          "children": "12岁以下儿童可免费入住",
          "pets": "不允许携带宠物"
        },
        "tags": ["舒适", "商务"],
        "services": [
          {"id": "laundry", "name": "洗衣服务"},
          {"id": "room_service", "name": "24小时客房服务"}
        ],
        "prices": {
          "2026-02-01": 329.00,
          "2026-02-02": 329.00,
          "2026-02-03": 429.00
        }
      },
      "套房": {
        "bed_type": "king",
        "area": 60,
        "description": "豪华套房，配备独立客厅和卧室，适合家庭或商务接待。空间宽敞，设施豪华。",
        "facilities": [
          {"id": "free_wifi", "name": "免费WiFi"},
          {"id": "air_conditioner", "name": "空调"},
          {"id": "tv", "name": "平板电视"},
          {"id": "minibar", "name": "迷你吧"},
          {"id": "bathtub", "name": "浴缸"},
          {"id": "workdesk", "name": "办公桌"},
          {"id": "sofa", "name": "沙发"}
        ],
        "room_image_url": "https://example.com/room3.jpg",
        "policies": {
          "cancellation": "入住前48小时可免费取消",
          "payment": "支持现金、信用卡、移动支付",
          "children": "12岁以下儿童可免费入住",
          "pets": "不允许携带宠物"
        },
        "tags": ["豪华", "家庭", "商务"],
        "services": [
          {"id": "airport_transfer", "name": "机场接送服务"},
          {"id": "laundry", "name": "洗衣服务"},
          {"id": "room_service", "name": "24小时客房服务"},
          {"id": "butler", "name": "管家服务"}
        ],
        "prices": {
          "2026-02-01": 599.00,
          "2026-02-02": 599.00,
          "2026-02-03": 699.00
        }
      }
    },
    "main_image_url": [
      "https://example.com/hotel1.jpg",
      "https://example.com/hotel2.jpg",
      "https://example.com/hotel3.jpg"
    ],
    "tags": ["亲子友好", "免费停车场", "含早餐"],
    "location_info": {
      "formatted_address": "北京市朝阳区阜通东大街6号",
      "country": "中国",
      "province": "北京市",
      "city": "北京市",
      "district": "朝阳区",
      "street": "阜通东大街",
      "number": "6号",
      "location": "116.482086,39.990496"
    }
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID |
| hotel_name | string | 酒店名称 |
| hotel_name_en | string | 酒店英文名称 |
| star_rating | number | 酒店星级 |
| rating | number | 评分 |
| review_count | number | 评论数 |
| description | string | 酒店描述 |
| phone | string | 酒店电话 |
| opening_date | string | 开业日期 |
| nearby_info | string | 周边信息 |
| facilities | array | 酒店设施 |
| facilities[].id | string | 设施ID |
| facilities[].name | string | 设施名称 |
| services | array | 酒店服务 |
| services[].id | string | 服务ID |
| services[].name | string | 服务名称 |
| policies | object | 酒店政策 |
| is_favorite | boolean | 当前用户是否收藏 |
| favorite_count | number | 收藏数 |
| room_prices | object | 房型价格列表 |
| room_prices.{房型名称} | object | 房型信息 |
| room_prices.{房型名称}.bed_type | string | 床型：king（大床）、twin（双床）、queen（中床）、family（家庭） |
| room_prices.{房型名称}.area | number | 房间面积（平方米） |
| room_prices.{房型名称}.description | string | 房间描述 |
| room_prices.{房型名称}.facilities | array | 房间设施列表 |
| room_prices.{房型名称}.facilities[].id | string | 设施ID |
| room_prices.{房型名称}.facilities[].name | string | 设施名称 |
| room_prices.{房型名称}.room_image_url | string | 房型图片URL |
| room_prices.{房型名称}.policies | object | 房间政策信息 |
| room_prices.{房型名称}.policies.cancellation | string | 取消政策 |
| room_prices.{房型名称}.policies.payment | string | 支付政策 |
| room_prices.{房型名称}.policies.children | string | 儿童政策 |
| room_prices.{房型名称}.policies.pets | string | 宠物政策 |
| room_prices.{房型名称}.tags | array | 房间标签 |
| room_prices.{房型名称}.services | array | 房间服务列表 |
| room_prices.{房型名称}.services[].id | string | 服务ID |
| room_prices.{房型名称}.services[].name | string | 服务名称 |
| room_prices.{房型名称}.prices | object | 每日价格（日期-价格映射） |
| room_prices.{房型名称}.prices.{日期} | number | 指定日期的价格（保留2位小数） |
| main_image_url | array | 酒店主图片URL列表 |
| tags | array | 酒店标签 |
| location_info | object | 位置信息 |
| location_info.formatted_address | string | 格式化地址 |
| location_info.country | string | 国家 |
| location_info.province | string | 省份 |
| location_info.city | string | 城市 |
| location_info.district | string | 区 |
| location_info.street | string | 街道 |
| location_info.number | string | 门牌号 |
| location_info.location | string | 经纬度坐标 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权，请先登录 |
| 4006 | 酒店不存在 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/mobile/hotels/hotel_001/detail?check_in=2026-02-01&check_out=2026-02-02" \
  -H "Authorization: Bearer {token}"
```

---

## 3. 日历和价格管理

### 3.1 获取可用日期和价格

**接口地址:** `GET /mobile/hotels/{hotel_id}/availability`

**描述:** 获取所有已设定日期的最低价格

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| hotel_id | string | 是 | 酒店ID |

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
    "hotel_id": "hotel_001",
    "start_date": "2026-02-01",
    "end_date": "2026-02-29",
    "calendar": [
      {
        "date": "2026-02-01",
        "is_available": true,
        "min_price": 299,
        "max_price": 599,
        "price_level": "low"
      },
      {
        "date": "2026-02-02",
        "is_available": true,
        "min_price": 299,
        "max_price": 599,
        "price_level": "low"
      },
      {
        "date": "2026-02-03",
        "is_available": false,
        "min_price": null,
        "max_price": null,
        "price_level": null
      }
    ]
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID |
| start_date | string | 开始日期 |
| end_date | string | 结束日期 |
| calendar | array | 日历数据 |
| calendar[].date | string | 日期 |
| calendar[].is_available | boolean | 是否可用 |
| calendar[].min_price | number | 最低价格 |
| calendar[].max_price | number | 最高价格 |
| calendar[].price_level | string | 价格等级 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权，请先登录 |
| 4006 | 酒店不存在 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/mobile/hotels/hotel_001/availability" \
  -H "Authorization: Bearer {token}"
```

---

### 3.2 计算价格

**接口地址:** `POST /mobile/hotels/{hotel_id}/calculate-price`

**描述:** 计算指定入住离店日期的价格

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| hotel_id | string | 是 | 酒店ID |

**请求头:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer {token} |
| Content-Type | string | 是 | application/json |

**请求体:**
```json
{
  "check_in": "2026-02-01",
  "check_out": "2026-02-02",
  "room_type": "大床房",
  "coupon_id": "coupon_001"
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| check_in | string | 是 | 入住日期（YYYY-MM-DD） |
| check_out | string | 是 | 离店日期（YYYY-MM-DD） |
| room_type | string | 是 | 房型名称 |
| coupon_id | string | 否 | 优惠券ID |

**响应示例:**
```json
{
  "code": 0,
  "msg": "计算成功",
  "data": {
    "hotel_id": "hotel_001",
    "room_type": "大床房",
    "check_in": "2026-02-01",
    "check_out": "2026-02-02",
    "price_breakdown": [
      {
        "item": "房费",
        "amount": 299,
        "type": "charge"
      },
      {
        "item": "服务费",
        "amount": 20,
        "type": "charge"
      },
      {
        "item": "税费",
        "amount": 15,
        "type": "charge"
      },
      {
        "item": "新人优惠",
        "amount": 50,
        "type": "discount"
      }
    ],
    "total_price": 284,
    "currency": "CNY"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID |
| room_type | string | 房型名称 |
| check_in | string | 入住日期 |
| check_out | string | 离店日期 |
| price_breakdown | array | 价格明细 |
| total_price | number | 总价格 |
| currency | string | 货币类型 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权，请先登录 |
| 4006 | 酒店不存在 |
| 4001 | 日期格式不正确 |
| 4002 | 离店日期必须晚于入住日期 |
| 4010 | 房型不存在 |
| 4011 | 所选日期不可预订 |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/mobile/hotels/hotel_001/calculate-price" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"check_in": "2026-02-01", "check_out": "2026-02-02", "room_type": "大床房", "coupon_id": "coupon_001"}'
```

---

## 4. 房型管理

### 4.1 获取房型详情

**接口地址:** `GET /mobile/hotels/{hotel_id}/room-types/{room_type}`

**描述:** 获取房型详细信息

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| hotel_id | string | 是 | 酒店ID |
| room_type | string | 是 | 房型名称 |
| check_in | string | 否 | 入住日期（YYYY-MM-DD） |
| check_out | string | 否 | 离店日期（YYYY-MM-DD） |

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
    "hotel_id": "hotel_001",
    "room_type": "豪华大床房",
    "room_info": {
      "bed_type": "king",
      "area": 35,
      "description": "豪华大床房，配备舒适的大床，适合情侣或独自出行。房间宽敞明亮，装修现代，设施齐全。",
      "facilities": [
        {"id": "free_wifi", "name": "免费WiFi"},
        {"id": "air_conditioner", "name": "空调"},
        {"id": "tv", "name": "平板电视"},
        {"id": "minibar", "name": "迷你吧"},
        {"id": "bathtub", "name": "浴缸"},
        {"id": "workdesk", "name": "办公桌"}
      ],
      "price": 399,
      "room_image_url": "https://example.com/room2_1.jpg",
      "policies": {
        "cancellation": "入住前48小时可免费取消",
        "payment": "支持现金、信用卡、移动支付",
        "children": "12岁以下儿童可免费入住",
        "pets": "不允许携带宠物"
      },
      "tags": ["受欢迎", "豪华", "性价比高"],
      "services": [
        {"id": "airport_transfer", "name": "机场接送服务"},
        {"id": "laundry", "name": "洗衣服务"},
        {"id": "room_service", "name": "24小时客房服务"}
      ]
    }
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID |
| room_type | string | 房型名称 |
| room_info | object | 房型详细信息 |
| room_info.bed_type | string | 床型 |
| room_info.area | number | 面积（平方米） |
| room_info.description | string | 房型描述 |
| room_info.facilities | array | 房型设施 |
| room_info.facilities[].id | string | 设施ID |
| room_info.facilities[].name | string | 设施名称 |
| room_info.price | number | 价格 |
| room_info.room_image_url | string | 房型图片URL |
| room_info.policies | object | 房型政策 |
| room_info.policies.cancellation | string | 取消政策 |
| room_info.policies.payment | string | 支付方式 |
| room_info.policies.children | string | 儿童政策 |
| room_info.policies.pets | string | 宠物政策 |
| room_info.tags | array | 房型标签 |
| room_info.services | array | 额外服务 |
| room_info.services[].id | string | 服务ID |
| room_info.services[].name | string | 服务名称 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权，请先登录 |
| 4006 | 酒店不存在 |
| 4010 | 房型不存在 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/mobile/hotels/hotel_001/room-types/豪华大床房?check_in=2026-02-01&check_out=2026-02-02" \
  -H "Authorization: Bearer {token}"
```

---

## 5. 预订管理

### 5.1 创建预订

**接口地址:** `POST /mobile/hotels/{hotel_id}/bookings`

**描述:** 创建酒店预订

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| hotel_id | string | 是 | 酒店ID |

**请求头:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer {token} |
| Content-Type | string | 是 | application/json |

**请求体:**
```json
{
  "check_in": "2026-02-01",
  "check_out": "2026-02-02",
  "room_type": "豪华大床房"
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| check_in | string | 是 | 入住日期（YYYY-MM-DD） |
| check_out | string | 是 | 离店日期（YYYY-MM-DD） |
| room_type | string | 是 | 房型名称 |

**响应示例:**
```json
{
  "code": 0,
  "msg": "预订成功",
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
| 4011 | 所选日期不可预订 |
| 4012 | 预订失败，请稍后重试 |
| 4013 | 优惠码无效 |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/mobile/hotels/hotel_001/bookings" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"check_in": "2026-02-01", "check_out": "2026-02-02", "room_type": "豪华大床房"}'
```

---

## 6. 收藏

### 6.1 收藏/取消收藏酒店

**接口地址:** `POST /mobile/hotels/{hotel_id}/favorite`

**描述:** 收藏或取消收藏酒店

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| hotel_id | string | 是 | 酒店ID |

**请求头:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer {token} |
| Content-Type | string | 是 | application/json |

**请求体:**
```json
{
  "action": "add"
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| action | string | 是 | 操作类型：add（收藏）, remove（取消收藏） |

**响应示例（收藏成功）:**
```json
{
  "code": 0,
  "msg": "收藏成功",
  "data": {
    "hotel_id": "hotel_001",
    "is_favorite": true,
    "favorite_count": 568,
    "message": "已添加到收藏夹"
  }
}
```

**响应示例（取消收藏成功）:**
```json
{
  "code": 0,
  "msg": "取消收藏成功",
  "data": {
    "hotel_id": "hotel_001",
    "is_favorite": false,
    "favorite_count": 566,
    "message": "已从收藏夹移除"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID |
| is_favorite | boolean | 当前收藏状态 |
| favorite_count | number | 收藏数 |
| message | string | 操作结果提示 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权，请先登录 |
| 4006 | 酒店不存在 |
| 4007 | 已收藏该酒店 |
| 4008 | 未收藏该酒店 |

**curl 示例:**
```bash
# 收藏酒店
curl -X POST "http://localhost:{PORT}/mobile/hotels/hotel_001/favorite" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"action": "add"}'

# 取消收藏酒店
curl -X POST "http://localhost:{PORT}/mobile/hotels/hotel_001/favorite" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"action": "remove"}'
```