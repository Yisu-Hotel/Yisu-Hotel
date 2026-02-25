# 酒店信息管理 API 接口文档

## 目录

- [基础信息](#基础信息)
- [酒店信息管理](#酒店信息管理)
- [地图相关](#地图相关)
- [审核相关](#审核相关)

## 1. 基础信息

- 基础URL: `http://localhost:{PORT}`
- 认证方式: Bearer Token（所有接口需在请求头中携带 `Authorization: Bearer {token}`）

## 2. 酒店信息管理

### 2.1 创建酒店信息

**接口地址:** `POST /hotel/create`

**描述:** 创建新的酒店信息并提交审核

**请求参数:** 无

**请求头:**
```
Authorization: Bearer {token}
```

**请求体:**
```json
{
  "hotel_name_cn": "易宿酒店",
  "hotel_name_en": "Yisu Hotel",
  "star_rating": 4,
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
      "room_image_base64": "data:image/png;base64,xxxx",
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
      "room_image_base64": "data:image/png;base64,xxxx",
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
      "room_image_base64": "data:image/png;base64,xxxx",
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
  "main_image_base64": [
    "data:image/png;base64,xxxx",
    "data:image/png;base64,xxxx"
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
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| hotel_name_cn | string | 是 | 酒店中文名称 |
| hotel_name_en | string | 是 | 酒店英文名称 |
| star_rating | int | 是 | 酒店星级（1-5星） |
| description | string | 是 | 酒店描述 |
| phone | string | 是 | 酒店联系电话 |
| opening_date | string | 是 | 开业时间（格式：YYYY-MM-DD） |
| nearby_info | string | 否 | 周边信息（景点、交通等） |
| facilities | array | 否 | 设施列表 |
| facilities[].id | string | 是 | 设施ID |
| facilities[].name | string | 是 | 设施名称 |
| services | array | 否 | 服务列表 |
| services[].id | string | 是 | 服务ID |
| services[].name | string | 是 | 服务名称 |
| policies | object | 否 | 政策信息 |
| policies.cancellation | string | 是 | 取消政策 |
| policies.payment | string | 是 | 支付政策 |
| policies.children | string | 是 | 儿童政策 |
| policies.pets | string | 是 | 宠物政策 |
| room_prices | object | 是 | 房型价格列表 |
| room_prices.{房型名称} | object | 是 | 房型信息 |
| room_prices.{房型名称}.bed_type | string | 是 | 床型：king（大床）、twin（双床）、queen（中床） |
| room_prices.{房型名称}.area | number | 是 | 房间面积（平方米） |
| room_prices.{房型名称}.description | string | 是 | 房间描述 |
| room_prices.{房型名称}.facilities | array | 否 | 房间设施列表 |
| room_prices.{房型名称}.facilities[].id | string | 否 | 设施ID |
| room_prices.{房型名称}.facilities[].name | string | 否 | 设施名称 |
| room_prices.{房型名称}.room_image_url | string | 否 | 房型图片URL |
| room_prices.{房型名称}.room_image_base64 | string | 否 | 房型图片Base64 |
| room_prices.{房型名称}.policies | object | 否 | 房间政策信息 |
| room_prices.{房型名称}.policies.cancellation | string | 否 | 取消政策 |
| room_prices.{房型名称}.policies.payment | string | 否 | 支付政策 |
| room_prices.{房型名称}.policies.children | string | 否 | 儿童政策 |
| room_prices.{房型名称}.policies.pets | string | 否 | 宠物政策 |
| room_prices.{房型名称}.tags | array | 否 | 房间标签 |
| room_prices.{房型名称}.services | array | 否 | 房间服务列表 |
| room_prices.{房型名称}.services[].id | string | 否 | 服务ID |
| room_prices.{房型名称}.services[].name | string | 否 | 服务名称 |
| room_prices.{房型名称}.prices | object | 是 | 每日价格（日期-价格映射） |
| room_prices.{房型名称}.prices.{日期} | number | 是 | 指定日期的价格（保留2位小数） |
| main_image_url | array | 否 | 酒店主图片URL列表 |
| main_image_base64 | array | 否 | 酒店主图片Base64列表 |
| tags | array | 否 | 酒店标签（如：亲子友好、免费停车场、含早餐） |
| location_info | object | 是 | 位置信息 |
| location_info.formatted_address | string | 是 | 格式化地址 |
| location_info.country | string | 是 | 国家 |
| location_info.province | string | 是 | 省份 |
| location_info.city | string | 是 | 城市 |
| location_info.district | string | 是 | 区 |
| location_info.street | string | 是 | 街道 |
| location_info.number | string | 是 | 门牌号 |
| location_info.location | string | 是 | 经纬度坐标 |

**响应示例:**
```json
{
  "code": 0,
  "msg": "酒店信息创建成功，等待审核",
  "data": {
    "hotel_id": "550e8400-e29b-41d4-a716-446655440001",
    "status": "pending"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID（UUID） |
| status | string | 状态：pending（待审核） |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4001 | 必填项不能为空 |
| 4002 | 酒店名称已存在 |
| 4003 | 酒店星级格式不正确 |
| 4004 | 房型格式不正确 |
| 4005 | 价格格式不正确 |
| 4006 | 开业时间格式不正确 |
| 4007 | 地址格式不正确 |
| 4008 | Token 无效或已过期 |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/hotel/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "hotel_name_cn": "易宿酒店",
    "hotel_name_en": "Yisu Hotel",
    "star_rating": 4,
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
        "room_image_base64": "data:image/png;base64,xxxx",
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
        "room_image_base64": "data:image/png;base64,xxxx",
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
        "room_image_base64": "data:image/png;base64,xxxx",
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
    "main_image_base64": [
      "data:image/png;base64,xxxx",
      "data:image/png;base64,xxxx"
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
  }'
```

---

### 2.2 保存草稿

**接口地址:** `POST /hotel/draft`

**描述:** 保存酒店信息草稿，未完成填写时可随时保存

**请求参数:** 无

**请求头:**
```
Authorization: Bearer {token}
```

**请求体:**
```json
{
  "hotel_name_cn": "易宿酒店",
  "hotel_name_en": "Yisu Hotel",
  "star_rating": 4,
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
      "room_image_base64": "data:image/png;base64,xxxx",
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
      "room_image_base64": "data:image/png;base64,xxxx",
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
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| hotel_name_cn | string | 否 | 酒店中文名称 |
| hotel_name_en | string | 否 | 酒店英文名称 |
| star_rating | int | 否 | 酒店星级（1-5星） |
| description | string | 否 | 酒店描述 |
| phone | string | 否 | 酒店联系电话 |
| opening_date | string | 否 | 开业时间（格式：YYYY-MM-DD） |
| nearby_info | string | 否 | 周边信息（景点、交通等） |
| facilities | array | 否 | 设施列表 |
| facilities[].id | string | 否 | 设施ID |
| facilities[].name | string | 否 | 设施名称 |
| services | array | 否 | 服务列表 |
| services[].id | string | 否 | 服务ID |
| services[].name | string | 否 | 服务名称 |
| policies | object | 否 | 政策信息 |
| policies.cancellation | string | 否 | 取消政策 |
| policies.payment | string | 否 | 支付政策 |
| policies.children | string | 否 | 儿童政策 |
| policies.pets | string | 否 | 宠物政策 |
| room_prices | object | 否 | 房型价格列表 |
| room_prices.{房型名称} | object | 否 | 房型信息 |
| room_prices.{房型名称}.bed_type | string | 否 | 床型：king（大床）、twin（双床）、queen（中床） |
| room_prices.{房型名称}.area | number | 否 | 房间面积（平方米） |
| room_prices.{房型名称}.description | string | 否 | 房间描述 |
| room_prices.{房型名称}.facilities | array | 否 | 房间设施列表 |
| room_prices.{房型名称}.facilities[].id | string | 否 | 设施ID |
| room_prices.{房型名称}.facilities[].name | string | 否 | 设施名称 |
| room_prices.{房型名称}.room_image_url | string | 否 | 房型图片URL |
| room_prices.{房型名称}.room_image_base64 | string | 否 | 房型图片Base64 |
| room_prices.{房型名称}.policies | object | 否 | 房间政策信息 |
| room_prices.{房型名称}.policies.cancellation | string | 否 | 取消政策 |
| room_prices.{房型名称}.policies.payment | string | 否 | 支付政策 |
| room_prices.{房型名称}.policies.children | string | 否 | 儿童政策 |
| room_prices.{房型名称}.policies.pets | string | 否 | 宠物政策 |
| room_prices.{房型名称}.tags | array | 否 | 房间标签 |
| room_prices.{房型名称}.services | array | 否 | 房间服务列表 |
| room_prices.{房型名称}.services[].id | string | 否 | 服务ID |
| room_prices.{房型名称}.services[].name | string | 否 | 服务名称 |
| room_prices.{房型名称}.prices | object | 否 | 每日价格（日期-价格映射） |
| room_prices.{房型名称}.prices.{日期} | number | 否 | 指定日期的价格（保留2位小数） |
| main_image_url | array | 否 | 酒店主图片URL列表 |
| main_image_base64 | array | 否 | 酒店主图片Base64列表 |
| tags | array | 否 | 酒店标签（如：亲子友好、免费停车场、含早餐） |
| location_info | object | 否 | 位置信息 |
| location_info.formatted_address | string | 否 | 格式化地址 |
| location_info.country | string | 否 | 国家 |
| location_info.province | string | 否 | 省份 |
| location_info.city | string | 否 | 城市 |
| location_info.district | string | 否 | 区 |
| location_info.street | string | 否 | 街道 |
| location_info.number | string | 否 | 门牌号 |
| location_info.location | string | 否 | 经纬度坐标 |

**响应示例:**
```json
{
  "code": 0,
  "msg": "草稿已保存",
  "data": {
    "hotel_id": "550e8400-e29b-41d4-a716-446655440001",
    "status": "draft"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID（UUID） |
| status | string | 状态：draft（草稿） |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4003 | 酒店星级格式不正确 |
| 4004 | 房型格式不正确 |
| 4005 | 价格格式不正确 |
| 4006 | 开业时间格式不正确 |
| 4007 | 地址格式不正确 |
| 4008 | Token 无效或已过期 |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/hotel/draft" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "hotel_name_cn": "易宿酒店",
    "hotel_name_en": "Yisu Hotel",
    "star_rating": 4,
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
    "room_prices": [
      {
        "room_type": "大床房",
        "price": 299.00,
        "total_price": 299.00
      },
      {
        "room_type": "双床房",
        "price": 329.00,
        "total_price": 329.00
      }
    ],
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
  }'
```

---

### 2.3 获取酒店列表

**接口地址:** `GET /hotel/list`

**描述:** 分页查询酒店列表（仅返回当前商户创建的酒店）

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| page_size | int | 否 | 每页数量，默认 10 |
| status | string | 否 | 状态筛选：draft（草稿）、pending（待审核）、approved（已通过）、rejected（已拒绝） |
| keyword | string | 否 | 搜索关键词（酒店名称） |

**请求头:**
```
Authorization: Bearer {token}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "total": 5,
    "page": 1,
    "page_size": 10,
    "list": [
      {
        "hotel_id": "550e8400-e29b-41d4-a716-446655440001",
        "hotel_name_cn": "易宿酒店",
        "hotel_name_en": "Yisu Hotel",
        "star_rating": 4,
        "main_image_url": [
          "https://example.com/hotel1.jpg",
          "https://example.com/hotel2.jpg",
          "https://example.com/hotel3.jpg"
        ],
        "main_image_base64": [
          "data:image/png;base64,xxxx"
        ],
        "tags": ["亲子友好", "免费停车场", "含早餐"],
        "location_info": {
          "formatted_address": "北京市朝阳区阜通东大街6号",
          "city": "北京市",
          "district": "朝阳区"
        },
        "status": "approved",
        "favorite_count": 128,
        "average_rating": 4.5,
        "booking_count": 356,
        "review_count": 89,
        "created_at": "2026-02-01T10:00:00.000Z",
        "updated_at": "2026-02-03T15:30:00.000Z"
      }
    ]
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| total | int | 总数量 |
| page | int | 当前页码 |
| page_size | int | 每页数量 |
| list | array | 酒店列表 |
| list[].hotel_id | string | 酒店ID |
| list[].hotel_name_cn | string | 酒店中文名称 |
| list[].hotel_name_en | string | 酒店英文名称 |
| list[].star_rating | int | 酒店星级 |
| list[].main_image_url | array | 酒店主图片URL列表 |
| list[].main_image_base64 | array | 酒店主图片Base64列表 |
| list[].tags | array | 酒店标签 |
| list[].location_info | object | 位置信息 |
| list[].location_info.formatted_address | string | 格式化地址 |
| list[].location_info.city | string | 城市 |
| list[].location_info.district | string | 区 |
| list[].status | string | 状态：draft（草稿）、pending（待审核）、approved（已通过）、rejected（已拒绝） |
| list[].favorite_count | int | 收藏量 |
| list[].average_rating | decimal | 平均评分（1-5分） |
| list[].booking_count | int | 预定量 |
| list[].review_count | int | 评论量 |
| list[].created_at | string | 创建时间 |
| list[].updated_at | string | 更新时间 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |
| 4009 | 参数格式不正确 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/hotel/list?page=1&page_size=10&status=approved" \
  -H "Authorization: Bearer {token}"
```

---

### 2.4 获取酒店详情

**接口地址:** `GET /hotel/detail/:id`

**描述:** 根据酒店ID获取详细信息

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 酒店ID（路径参数） |

**请求头:**
```
Authorization: Bearer {token}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "hotel_id": "550e8400-e29b-41d4-a716-446655440001",
    "hotel_name_cn": "易宿酒店",
    "hotel_name_en": "Yisu Hotel",
    "star_rating": 4,
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
        "room_image_base64": "data:image/png;base64,xxxx",
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
        "room_image_base64": "data:image/png;base64,xxxx",
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
        "room_image_base64": "data:image/png;base64,xxxx",
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
    "main_image_base64": [
      "data:image/png;base64,xxxx",
      "data:image/png;base64,xxxx"
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
    },
    "status": "approved",
    "created_by": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2026-02-01T10:00:00.000Z",
    "updated_at": "2026-02-03T15:30:00.000Z"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID |
| hotel_name_cn | string | 酒店中文名称 |
| hotel_name_en | string | 酒店英文名称 |
| star_rating | int | 酒店星级 |
| description | string | 酒店描述 |
| phone | string | 酒店联系电话 |
| opening_date | string | 开业时间 |
| nearby_info | string | 周边信息 |
| facilities | array | 设施列表 |
| facilities[].id | string | 设施ID |
| facilities[].name | string | 设施名称 |
| services | array | 服务列表 |
| services[].id | string | 服务ID |
| services[].name | string | 服务名称 |
| policies | object | 政策信息 |
| policies.cancellation | string | 取消政策 |
| policies.payment | string | 支付政策 |
| policies.children | string | 儿童政策 |
| policies.pets | string | 宠物政策 |
| room_prices | object | 房型价格列表 |
| room_prices.{房型名称} | object | 房型信息 |
| room_prices.{房型名称}.bed_type | string | 床型：king（大床）、twin（双床）、queen（中床） |
| room_prices.{房型名称}.area | number | 房间面积（平方米） |
| room_prices.{房型名称}.description | string | 房间描述 |
| room_prices.{房型名称}.facilities | array | 房间设施列表 |
| room_prices.{房型名称}.facilities[].id | string | 设施ID |
| room_prices.{房型名称}.facilities[].name | string | 设施名称 |
| room_prices.{房型名称}.room_image_url | string | 房型图片URL |
| room_prices.{房型名称}.room_image_base64 | string | 房型图片Base64 |
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
| main_image_base64 | array | 酒店主图片Base64列表 |
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
| status | string | 状态 |
| created_by | string | 创建人ID |
| created_at | string | 创建时间 |
| updated_at | string | 更新时间 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |
| 4010 | 酒店不存在 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/hotel/detail/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer {token}"
```

---

### 2.5 更新酒店信息

**接口地址:** `PUT /hotel/update/:id`

**描述:** 更新已录入的酒店信息

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 酒店ID（路径参数） |

**请求头:**
```
Authorization: Bearer {token}
```

**请求体:**
```json
{
  "hotel_name_cn": "易宿酒店（更新）",
  "hotel_name_en": "Yisu Hotel (Updated)",
  "star_rating": 5,
  "description": "易宿酒店位于北京市朝阳区核心地段，交通便利，周边配套设施齐全。酒店拥有舒适的客房和完善的服务设施，是商务出行和休闲旅游的理想选择。",
  "phone": "010-12345678",
  "opening_date": "2020-01-01",
  "nearby_info": "距离地铁站300米，周边有商场、餐厅、公园",
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
      "room_image_url": "https://example.com/room1_updated.jpg",
      "room_image_base64": "data:image/png;base64,xxxx",
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
        "2026-02-01": 399.00,
        "2026-02-02": 399.00,
        "2026-02-03": 499.00
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
      "room_image_url": "https://example.com/room2_updated.jpg",
      "room_image_base64": "data:image/png;base64,xxxx",
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
        "2026-02-01": 429.00,
        "2026-02-02": 429.00,
        "2026-02-03": 529.00
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
      "room_image_url": "https://example.com/room3_updated.jpg",
      "room_image_base64": "data:image/png;base64,xxxx",
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
        "2026-02-01": 699.00,
        "2026-02-02": 699.00,
        "2026-02-03": 799.00
      }
    },
    "家庭房": {
      "bed_type": "family",
      "area": 50,
      "description": "温馨家庭房，配备一张大床和一张单人床，适合一家三口入住。房间温馨舒适，设施齐全。",
      "facilities": [
        {"id": "free_wifi", "name": "免费WiFi"},
        {"id": "air_conditioner", "name": "空调"},
        {"id": "tv", "name": "平板电视"},
        {"id": "minibar", "name": "迷你吧"},
        {"id": "bathtub", "name": "浴缸"},
        {"id": "workdesk", "name": "办公桌"}
      ],
      "room_image_url": "https://example.com/room4_updated.jpg",
      "room_image_base64": "data:image/png;base64,xxxx",
      "policies": {
        "cancellation": "入住前48小时可免费取消",
        "payment": "支持现金、信用卡、移动支付",
        "children": "12岁以下儿童可免费入住",
        "pets": "不允许携带宠物"
      },
      "tags": ["家庭", "温馨", "性价比高"],
      "services": [
        {"id": "laundry", "name": "洗衣服务"},
        {"id": "room_service", "name": "24小时客房服务"}
      ],
      "prices": {
        "2026-02-01": 599.00,
        "2026-02-02": 599.00,
        "2026-02-03": 699.00
      }
    }
  },
  "main_image_url": [
    "https://example.com/hotel1_updated.jpg",
    "https://example.com/hotel2_updated.jpg",
    "https://example.com/hotel3_updated.jpg"
  ],
  "main_image_base64": [
    "data:image/png;base64,xxxx",
    "data:image/png;base64,xxxx"
  ],
  "tags": ["亲子友好", "免费停车场", "含早餐", "商务中心"],
  "location_info": {
    "formatted_address": "北京市朝阳区阜通东大街100号",
    "country": "中国",
    "province": "北京市",
    "city": "北京市",
    "district": "朝阳区",
    "street": "阜通东大街",
    "number": "100号",
    "location": "116.482086,39.990496"
  }
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| hotel_name_cn | string | 否 | 酒店中文名称 |
| hotel_name_en | string | 否 | 酒店英文名称 |
| star_rating | int | 否 | 酒店星级（1-5星） |
| description | string | 否 | 酒店描述 |
| phone | string | 否 | 酒店联系电话 |
| opening_date | string | 否 | 开业时间（格式：YYYY-MM-DD） |
| nearby_info | string | 否 | 周边信息（景点、交通等） |
| facilities | array | 否 | 设施列表 |
| facilities[].id | string | 否 | 设施ID |
| facilities[].name | string | 否 | 设施名称 |
| services | array | 否 | 服务列表 |
| services[].id | string | 否 | 服务ID |
| services[].name | string | 否 | 服务名称 |
| policies | object | 否 | 政策信息 |
| policies.cancellation | string | 否 | 取消政策 |
| policies.payment | string | 否 | 支付政策 |
| policies.children | string | 否 | 儿童政策 |
| policies.pets | string | 否 | 宠物政策 |
| room_prices | object | 否 | 房型价格列表 |
| room_prices.{房型名称} | object | 否 | 房型信息 |
| room_prices.{房型名称}.bed_type | string | 否 | 床型：king（大床）、twin（双床）、queen（中床）、family（家庭） |
| room_prices.{房型名称}.area | number | 否 | 房间面积（平方米） |
| room_prices.{房型名称}.description | string | 否 | 房间描述 |
| room_prices.{房型名称}.facilities | array | 否 | 房间设施列表 |
| room_prices.{房型名称}.facilities[].id | string | 否 | 设施ID |
| room_prices.{房型名称}.facilities[].name | string | 否 | 设施名称 |
| room_prices.{房型名称}.room_image_url | string | 否 | 房型图片URL |
| room_prices.{房型名称}.room_image_base64 | string | 否 | 房型图片Base64 |
| room_prices.{房型名称}.policies | object | 否 | 房间政策信息 |
| room_prices.{房型名称}.policies.cancellation | string | 否 | 取消政策 |
| room_prices.{房型名称}.policies.payment | string | 否 | 支付政策 |
| room_prices.{房型名称}.policies.children | string | 否 | 儿童政策 |
| room_prices.{房型名称}.policies.pets | string | 否 | 宠物政策 |
| room_prices.{房型名称}.tags | array | 否 | 房间标签 |
| room_prices.{房型名称}.services | array | 否 | 房间服务列表 |
| room_prices.{房型名称}.services[].id | string | 否 | 服务ID |
| room_prices.{房型名称}.services[].name | string | 否 | 服务名称 |
| room_prices.{房型名称}.prices | object | 否 | 每日价格（日期-价格映射） |
| room_prices.{房型名称}.prices.{日期} | number | 否 | 指定日期的价格（保留2位小数） |
| main_image_url | array | 否 | 酒店主图片URL列表 |
| main_image_base64 | array | 否 | 酒店主图片Base64列表 |
| tags | array | 否 | 酒店标签（如：亲子友好、免费停车场、含早餐） |
| location_info | object | 否 | 位置信息 |
| location_info.formatted_address | string | 否 | 格式化地址 |
| location_info.country | string | 否 | 国家 |
| location_info.province | string | 否 | 省份 |
| location_info.city | string | 否 | 城市 |
| location_info.district | string | 否 | 区 |
| location_info.street | string | 否 | 街道 |
| location_info.number | string | 否 | 门牌号 |
| location_info.location | string | 否 | 经纬度坐标 |

**响应示例:**
```json
{
  "code": 0,
  "msg": "更新成功",
  "data": {
    "hotel_id": "550e8400-e29b-41d4-a716-446655440001",
    "updated_at": "2026-02-05T10:00:00.000Z"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID |
| updated_at | string | 更新时间 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4003 | 酒店星级格式不正确 |
| 4004 | 房型格式不正确 |
| 4005 | 价格格式不正确 |
| 4006 | 开业时间格式不正确 |
| 4007 | 地址格式不正确 |
| 4008 | Token 无效或已过期 |
| 4010 | 酒店不存在 |
| 4011 | 无权限修改此酒店 |

**curl 示例:**
```bash
curl -X PUT "http://localhost:{PORT}/hotel/update/550e8400-e29b-41d4-a716-446655440001" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "hotel_name_cn": "易宿酒店（更新）",
    "hotel_name_en": "Yisu Hotel (Updated)",
    "location_info": {
      "formatted_address": "北京市朝阳区建国路100号",
      "country": "中国",
      "province": "北京市",
      "city": "北京市",
      "district": "朝阳区",
      "street": "建国路",
      "number": "100号",
      "location": "116.482086,39.990496"
    },
    "star_rating": 5,
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
        "room_image_url": "https://example.com/room1_updated.jpg",
        "room_image_base64": "data:image/png;base64,xxxx",
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
          "2026-02-01": 399.00,
          "2026-02-02": 399.00,
          "2026-02-03": 499.00
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
        "room_image_url": "https://example.com/room2_updated.jpg",
        "room_image_base64": "data:image/png;base64,xxxx",
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
          "2026-02-01": 429.00,
          "2026-02-02": 429.00,
          "2026-02-03": 529.00
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
        "room_image_url": "https://example.com/room3_updated.jpg",
        "room_image_base64": "data:image/png;base64,xxxx",
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
          "2026-02-01": 699.00,
          "2026-02-02": 699.00,
          "2026-02-03": 799.00
        }
      },
      "家庭房": {
        "bed_type": "family",
        "area": 50,
        "description": "温馨家庭房，配备一张大床和一张单人床，适合一家三口入住。房间温馨舒适，设施齐全。",
        "facilities": [
          {"id": "free_wifi", "name": "免费WiFi"},
          {"id": "air_conditioner", "name": "空调"},
          {"id": "tv", "name": "平板电视"},
          {"id": "minibar", "name": "迷你吧"},
          {"id": "bathtub", "name": "浴缸"},
          {"id": "workdesk", "name": "办公桌"}
        ],
        "room_image_url": "https://example.com/room4_updated.jpg",
        "room_image_base64": "data:image/png;base64,xxxx",
        "policies": {
          "cancellation": "入住前48小时可免费取消",
          "payment": "支持现金、信用卡、移动支付",
          "children": "12岁以下儿童可免费入住",
          "pets": "不允许携带宠物"
        },
        "tags": ["家庭", "温馨", "性价比高"],
        "services": [
          {"id": "laundry", "name": "洗衣服务"},
          {"id": "room_service", "name": "24小时客房服务"}
        ],
        "prices": {
          "2026-02-01": 599.00,
          "2026-02-02": 599.00,
          "2026-02-03": 699.00
        }
      }
    },
    "opening_date": "2020-01-01",
    "nearby_info": "距离地铁站300米，周边有商场、餐厅、公园",
    "promotion_scenario": "机票+酒店套餐",
    "tags": ["亲子友好", "免费停车场", "含早餐", "商务中心"]
  }'
```

---

### 2.6 删除酒店

**接口地址:** `DELETE /hotel/delete/:id`

**描述:** 删除酒店信息

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 酒店ID（路径参数） |

**请求头:**
```
Authorization: Bearer {token}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "删除成功",
  "data": null
}
```

**响应字段说明:** 无

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |
| 4010 | 酒店不存在 |
| 4011 | 无权限删除此酒店 |
| 4012 | 酒店状态不允许删除 |

**curl 示例:**
```bash
curl -X DELETE "http://localhost:{PORT}/hotel/delete/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer {token}"
```

---

### 2.7 获取历史记录

**接口地址:** `GET /hotel/history/:id`

**描述:** 获取酒店最近3次修改记录

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 酒店ID（路径参数） |

**请求头:**
```
Authorization: Bearer {token}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "hotel_id": "550e8400-e29b-41d4-a716-446655440001",
    "history": [
      {
        "version": 3,
        "modified_by": "550e8400-e29b-41d4-a716-446655440000",
        "modified_at": "2026-02-05T10:00:00.000Z",
        "changes": {
          "star_rating": 5,
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
              "room_image_url": "https://example.com/room1_updated.jpg",
              "room_image_base64": "data:image/png;base64,xxxx",
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
                "2026-02-01": 399.00,
                "2026-02-02": 399.00,
                "2026-02-03": 499.00
              }
            }
          }
        }
      },
      {
        "version": 2,
        "modified_by": "550e8400-e29b-41d4-a716-446655440001",
        "modified_at": "2026-02-03T15:30:00.000Z",
        "changes": {
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
              "room_image_base64": "data:image/png;base64,xxxx",
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
              "room_image_base64": "data:image/png;base64,xxxx",
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
              "room_image_base64": "data:image/png;base64,xxxx",
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
          }
        }
      },
      {
        "version": 1,
        "modified_by": "550e8400-e29b-41d4-a716-446655440000",
        "modified_at": "2026-02-01T10:00:00.000Z",
        "changes": {
          "hotel_name_cn": "易宿酒店",
          "hotel_name_en": "Yisu Hotel"
        }
      }
    ]
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID |
| history | array | 历史记录列表（最多3条） |
| history[].version | int | 版本号 |
| history[].modified_by | string | 修改人ID |
| history[].modified_at | string | 修改时间 |
| history[].changes | object | 修改内容 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |
| 4010 | 酒店不存在 |
| 4011 | 无权限查看此酒店历史 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/hotel/history/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer {token}"
```

## 3. 地图相关

### 3.1 地址逆地理编码

**接口地址:** `GET /map/geocode/reverse`

**描述:** 根据经纬度获取详细地址信息（高德地图API）

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| location | string | 是 | 经纬度，格式：经度,纬度（如：116.397428,39.90923） |

**请求头:**
```
Authorization: Bearer {token}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "formatted_address": "北京市朝阳区建国路88号",
    "country": "中国",
    "province": "北京市",
    "city": "北京市",
    "district": "朝阳区",
    "street": "建国路",
    "number": "88号",
    "location": "116.397428,39.90923"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| formatted_address | string | 完整地址 |
| country | string | 国家 |
| province | string | 省份 |
| city | string | 城市 |
| district | string | 区县 |
| street | string | 街道 |
| number | string | 门牌号 |
| location | string | 经纬度（格式：经度,纬度） |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |
| 4013 | 经纬度格式不正确 |
| 4014 | 地图服务异常 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/map/geocode/reverse?location=116.397428,39.90923" \
  -H "Authorization: Bearer {token}"
```

---

### 3.2 地址地理编码

**接口地址:** `GET /map/geocode`

**描述:** 根据地址获取经纬度信息（高德地图API）

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| address | string | 是 | 地址（如：北京市朝阳区建国路88号） |

**请求头:**
```
Authorization: Bearer {token}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "formatted_address": "北京市朝阳区建国路88号",
    "country": "中国",
    "province": "北京市",
    "city": "北京市",
    "district": "朝阳区",
    "street": "建国路",
    "number": "88号",
    "location": "116.397428,39.90923"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| formatted_address | string | 完整地址 |
| country | string | 国家 |
| province | string | 省份 |
| city | string | 城市 |
| district | string | 区县 |
| street | string | 街道 |
| number | string | 门牌号 |
| location | string | 经纬度（格式：经度,纬度） |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |
| 4015 | 地址格式不正确 |
| 4016 | 地址解析失败 |
| 4014 | 地图服务异常 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/map/geocode?address=北京市朝阳区建国路88号" \
  -H "Authorization: Bearer {token}"
```

## 4. 审核相关

### 4.1 提交审核

**接口地址:** `POST /hotel/submit/:id`

**描述:** 将草稿状态的酒店信息提交审核

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 酒店ID（路径参数） |

**请求头:**
```
Authorization: Bearer {token}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "提交审核成功",
  "data": {
    "hotel_id": "550e8400-e29b-41d4-a716-446655440001",
    "status": "pending"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID |
| status | string | 状态：pending（待审核） |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4001 | 必填项不能为空 |
| 4008 | Token 无效或已过期 |
| 4010 | 酒店不存在 |
| 4011 | 无权限提交此酒店 |
| 4017 | 酒店状态不允许提交审核 |
| 4018 | 酒店已在审核中 |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/hotel/submit/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer {token}"
```

---

### 4.2 获取审核状态

**接口地址:** `GET /hotel/audit-status/:id`

**描述:** 查询酒店审核状态

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 酒店ID（路径参数） |

**请求头:**
```
Authorization: Bearer {token}
```

**响应示例（待审核）:**
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "hotel_id": "550e8400-e29b-41d4-a716-446655440001",
    "status": "pending",
    "status_text": "待审核",
    "submitted_at": "2026-02-05T10:00:00.000Z"
  }
}
```

**响应示例（已通过）:**
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "hotel_id": "550e8400-e29b-41d4-a716-446655440001",
    "status": "approved",
    "status_text": "已通过",
    "submitted_at": "2026-02-05T10:00:00.000Z",
    "audited_at": "2026-02-05T14:00:00.000Z",
    "audited_by": "管理员"
  }
}
```

**响应示例（已拒绝）:**
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "hotel_id": "550e8400-e29b-41d4-a716-446655440001",
    "status": "rejected",
    "status_text": "已拒绝",
    "submitted_at": "2026-02-05T10:00:00.000Z",
    "audited_at": "2026-02-05T14:00:00.000Z",
    "audited_by": "管理员",
    "reject_reason": "酒店信息不完整，请补充周边信息"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID |
| status | string | 状态：draft（草稿）、pending（待审核）、approved（已通过）、rejected（已拒绝） |
| status_text | string | 状态文本 |
| submitted_at | string | 提交时间 |
| audited_at | string | 审核时间（已审核时返回） |
| audited_by | string | 审核人（已审核时返回） |
| reject_reason | string | 拒绝原因（被拒绝时返回） |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |
| 4010 | 酒店不存在 |
| 4011 | 无权限查看此酒店审核状态 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/hotel/audit-status/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer {token}"
```

---

### 4.3 获取审核状态列表

**接口地址:** `GET /hotel/audit-list`

**描述:** 分页查询审核状态列表（商户端，仅返回当前用户提交审核的酒店）

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| page_size | int | 否 | 每页数量，默认 10 |
| status | string | 否 | 状态筛选：pending（待审核）、approved（已通过）、rejected（已拒绝） |

**请求头:**
```
Authorization: Bearer {token}
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "total": 15,
    "page": 1,
    "page_size": 10,
    "list": [
      {
        "hotel_id": "550e8400-e29b-41d4-a716-446655440001",
        "hotel_name_cn": "易宿酒店",
        "submitted_at": "2026-02-05T10:00:00.000Z",
        "status": "pending",
        "status_text": "待审核"
      },
      {
        "hotel_id": "550e8400-e29b-41d4-a716-446655440002",
        "hotel_name_cn": "阳光酒店",
        "submitted_at": "2026-02-04T14:00:00.000Z",
        "status": "approved",
        "status_text": "已通过",
        "audited_at": "2026-02-05T09:00:00.000Z",
        "audited_by": "550e8400-e29b-41d4-a716-446655440001"
      },
      {
        "hotel_id": "550e8400-e29b-41d4-a716-446655440003",
        "hotel_name_cn": "星空酒店",
        "submitted_at": "2026-02-03T16:00:00.000Z",
        "status": "rejected",
        "status_text": "已拒绝",
        "audited_at": "2026-02-04T10:00:00.000Z",
        "audited_by": "550e8400-e29b-41d4-a716-446655440001",
        "reject_reason": "酒店信息不完整，请补充周边信息"
      }
    ]
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| total | int | 总数量 |
| page | int | 当前页码 |
| page_size | int | 每页数量 |
| list | array | 审核状态列表 |
| list[].hotel_id | string | 酒店ID |
| list[].hotel_name_cn | string | 酒店名称 |
| list[].submitted_at | string | 提交时间 |
| list[].status | string | 状态：pending（待审核）、approved（已通过）、rejected（已拒绝） |
| list[].status_text | string | 状态文本 |
| list[].audited_at | string | 审核时间（已审核时返回） |
| list[].audited_by | string | 审核人ID（已审核时返回） |
| list[].reject_reason | string | 拒绝原因（被拒绝时返回） |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |
| 4009 | 参数格式不正确 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/hotel/audit-list?page=1&page_size=10&status=pending" \
  -H "Authorization: Bearer {token}"
```
