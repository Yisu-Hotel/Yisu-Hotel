# 手机端 API 接口文档 - 酒店查询页

## 目录

- [基础信息](#基础信息)
- [Banner管理](#bannermanagement)
- [城市定位](#citylocation)
- [酒店搜索](#hotelsearch)
- [筛选管理](#filtramanagement)
- [快捷标签](#quicktags)

## 1. 基础信息

- 基础URL: `http://localhost:{PORT}`
- 认证方式: Bearer Token（所有接口需在请求头中携带 `Authorization: Bearer {token}`）
- 字符集: UTF-8
- 时区: UTC

## 2. Banner管理

### 2.1 获取首页Banner

**接口地址:** `GET /mobile/banner/list`

**描述:** 获取首页推广广告Banner列表

**请求参数:** 无

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
    "banners": [
      {
        "id": "banner_001",
        "image_url": "https://example.com/banner1.jpg",
        "title": "春节特惠，低至 8 折",
        "description": "精选酒店春节促销",
        "target_type": "hotel",
        "target_id": "hotel_001",
        "sort": 1,
        "start_time": "2026-01-01T00:00:00Z",
        "end_time": "2026-02-28T23:59:59Z",
        "is_active": true
      },
      {
        "id": "banner_002",
        "image_url": "https://example.com/banner2.jpg",
        "title": "新用户专享优惠",
        "description": "首次预订立减 50 元",
        "target_type": "promotion",
        "target_id": "promo_001",
        "sort": 2,
        "start_time": "2026-01-01T00:00:00Z",
        "end_time": "2026-12-31T23:59:59Z",
        "is_active": true
      }
    ]
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| banners | array | Banner列表 |
| banners[].id | string | BannerID |
| banners[].image_url | string | Banner图片URL |
| banners[].title | string | Banner标题 |
| banners[].description | string | Banner描述 |
| banners[].target_type | string | 目标类型：hotel（酒店）、promotion（优惠）、url（链接） |
| banners[].target_id | string | 目标ID |
| banners[].sort | number | 排序权重 |
| banners[].start_time | string | 开始时间 |
| banners[].end_time | string | 结束时间 |
| banners[].is_active | boolean | 是否激活 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权，请先登录 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/mobile/banner/list" \
  -H "Authorization: Bearer {token}"
```

## 3. 城市定位

### 3.1 获取当前城市

**接口地址:** `GET /mobile/city/current`

**描述:** 获取用户当前所在城市（基于IP定位）

**请求参数:** 无

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
    "city_id": "city_001",
    "city_name": "北京市",
    "latitude": 39.9042,
    "longitude": 116.4074,
    "is_default": true
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| city_id | string | 城市ID |
| city_name | string | 城市名称 |
| latitude | number | 纬度 |
| longitude | number | 经度 |
| is_default | boolean | 是否默认城市 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权，请先登录 |
| 4001 | 定位失败，请手动选择城市 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/mobile/city/current" \
  -H "Authorization: Bearer {token}"
```

### 3.2 切换默认城市

**接口地址:** `POST /mobile/city/set-default`

**描述:** 设置默认城市

**请求参数:** 无

**请求头:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer {token} |
| Content-Type | string | 是 | application/json |

**请求体:**
```json
{
  "city_id": "city_001",
  "city_name": "北京市"
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| city_id | string | 是 | 城市ID |
| city_name | string | 是 | 城市名称 |

**响应示例:**
```json
{
  "code": 0,
  "msg": "设置成功",
  "data": {
    "city_id": "city_001",
    "city_name": "北京市",
    "is_default": true
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| city_id | string | 城市ID |
| city_name | string | 城市名称 |
| is_default | boolean | 是否默认城市 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权，请先登录 |
| 4002 | 城市ID无效 |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/mobile/city/set-default" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"city_id": "city_001", "city_name": "北京市"}'
```

### 3.3 搜索城市

**接口地址:** `GET /mobile/city/search`

**描述:** 根据关键字搜索城市

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | string | 是 | 搜索关键字（城市名称） |

**请求头:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer {token} |

**响应示例:**
```json
{
  "code": 0,
  "msg": "搜索成功",
  "data": {
    "cities": [
      {
        "city_id": "city_001",
        "city_name": "北京市",
        "latitude": 39.9042,
        "longitude": 116.4074
      },
      {
        "city_id": "city_002",
        "city_name": "北京市朝阳区",
        "latitude": 39.9219,
        "longitude": 116.4551
      }
    ]
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| cities | array | 城市列表 |
| cities[].city_id | string | 城市ID |
| cities[].city_name | string | 城市名称 |
| cities[].latitude | number | 纬度 |
| cities[].longitude | number | 经度 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权，请先登录 |
| 4003 | 搜索关键字不能为空 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/mobile/city/search?keyword=北京" \
  -H "Authorization: Bearer {token}"
```

## 4. 酒店搜索

### 4.1 综合搜索酒店

**接口地址:** `GET /mobile/hotels/search`

**描述:** 综合搜索酒店（支持关键字、城市、日期、筛选条件等）

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | string | 否 | 搜索关键字（酒店名称、品牌等） |
| city_id | string | 否 | 城市ID |
| city_name | string | 否 | 城市名称 |
| check_in | string | 否 | 入住日期（YYYY-MM-DD） |
| check_out | string | 否 | 离店日期（YYYY-MM-DD） |
| min_price | number | 否 | 最低价格 |
| max_price | number | 否 | 最高价格 |
| stars | string | 否 | 星级（逗号分隔，如：3,4,5） |
| tags | string | 否 | 标签（逗号分隔，如：亲子友好,免费停车场,含早餐） |
| sort_by | string | 否 | 排序方式：price_asc, price_desc, distance_asc, rating_desc |
| page | number | 否 | 页码，默认1 |
| page_size | number | 否 | 每页数量，默认20 |

**请求头:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer {token} |

**响应示例:**
```json
{
  "code": 0,
  "msg": "搜索成功",
  "data": {
    "total": 5,
    "page": 1,
    "page_size": 20,
    "list": [
      {
        "hotel_id": "550e8400-e29b-41d4-a716-446655440001",
        "hotel_name": "易宿酒店",
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
        "main_image_url": "https://example.com/hotel1.jpg",
        "room_prices": [
          {
            "room_type": "大床房",
            "price": 299.00,
            "room_image_url": "https://example.com/room1.jpg"
          },
          {
            "room_type": "双床房",
            "price": 329.00,
            "room_image_url": "https://example.com/room2.jpg"
          }
        ],
        "tags": ["亲子友好", "免费停车场", "含早餐"],
        "location_info": {
          "formatted_address": "北京市朝阳区建国路88号",
          "country": "中国",
          "province": "北京市",
          "city": "北京市",
          "district": "朝阳区",
          "street": "建国路",
          "number": "88号",
          "location": "116.397428,39.90923"
        },
        "status": "approved",
        "created_by": "550e8400-e29b-41d4-a716-446655440000",
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
| list[].hotel_name | string | 酒店名称 |
| list[].hotel_name_en | string | 酒店英文名称 |
| list[].star_rating | int | 酒店星级 |
| list[].description | string | 酒店描述 |
| list[].phone | string | 酒店电话 |
| list[].opening_date | string | 开业日期 |
| list[].nearby_info | string | 周边信息 |
| list[].facilities | array | 酒店设施 |
| list[].facilities[].id | string | 设施ID |
| list[].facilities[].name | string | 设施名称 |
| list[].services | array | 酒店服务 |
| list[].services[].id | string | 服务ID |
| list[].services[].name | string | 服务名称 |
| list[].policies | object | 酒店政策 |
| list[].policies.cancellation | string | 取消政策 |
| list[].policies.payment | string | 支付政策 |
| list[].policies.children | string | 儿童政策 |
| list[].policies.pets | string | 宠物政策 |
| list[].main_image_url | string | 酒店主图片URL |
| list[].room_prices | array | 房型价格列表 |
| list[].room_prices[].room_type | string | 房型名称 |
| list[].room_prices[].price | number | 房型价格 |
| list[].room_prices[].room_image_url | string | 房型图片URL |
| list[].tags | array | 酒店标签 |
| list[].location_info | object | 位置信息 |
| list[].location_info.formatted_address | string | 格式化地址 |
| list[].location_info.country | string | 国家 |
| list[].location_info.province | string | 省份 |
| list[].location_info.city | string | 城市 |
| list[].location_info.district | string | 区 |
| list[].location_info.street | string | 街道 |
| list[].location_info.number | string | 门牌号 |
| list[].location_info.location | string | 经纬度坐标 |
| list[].status | string | 状态 |
| list[].created_by | string | 创建人ID |
| list[].created_at | string | 创建时间 |
| list[].updated_at | string | 更新时间 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权，请先登录 |
| 4004 | 日期格式不正确 |
| 4005 | 离店日期必须晚于入住日期 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/mobile/hotels/search?keyword=酒店&city_id=city_001&check_in=2026-02-01&check_out=2026-02-02&min_price=200&max_price=600&stars=4,5&tags=亲子友好,免费停车场,含早餐" \
  -H "Authorization: Bearer {token}"
```

## 5. 筛选管理

### 5.1 获取筛选选项

**接口地址:** `GET /mobile/filters/options`

**描述:** 获取酒店筛选选项（星级、价格区间、标签等）

**请求参数:** 无

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
    "stars": [
      {"value": 1, "label": "1星", "count": 10},
      {"value": 2, "label": "2星", "count": 25},
      {"value": 3, "label": "3星", "count": 45},
      {"value": 4, "label": "4星", "count": 30},
      {"value": 5, "label": "5星", "count": 15}
    ],
    "price_ranges": [
      {"min": 0, "max": 200, "label": "200元以下", "count": 30},
      {"min": 200, "max": 400, "label": "200-400元", "count": 45},
      {"min": 400, "max": 600, "label": "400-600元", "count": 35},
      {"min": 600, "max": 800, "label": "600-800元", "count": 20},
      {"min": 800, "max": null, "label": "800元以上", "count": 15}
    ],
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
    "tags": [
      {"name": "亲子友好", "count": 45},
      {"name": "免费停车场", "count": 80},
      {"name": "含早餐", "count": 60},
      {"name": "免费WiFi", "count": 100},
      {"name": "商务中心", "count": 55},
      {"name": "健身房", "count": 50}
    ]
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| stars | array | 星级选项 |
| stars[].value | number | 星级值 |
| stars[].label | string | 星级标签 |
| stars[].count | number | 数量 |
| price_ranges | array | 价格区间 |
| price_ranges[].min | number | 最低价格 |
| price_ranges[].max | number | 最高价格（null表示无上限） |
| price_ranges[].label | string | 价格标签 |
| price_ranges[].count | number | 数量 |
| facilities | array | 设施选项 |
| facilities[].id | string | 设施ID |
| facilities[].name | string | 设施名称 |
| facilities[].count | number | 数量 |
| services | array | 服务选项 |
| services[].id | string | 服务ID |
| services[].name | string | 服务名称 |
| services[].count | number | 数量 |
| tags | array | 标签选项（来自附近酒店的tags） |
| tags[].name | string | 标签名称 |
| tags[].count | number | 数量 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权，请先登录 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/mobile/filters/options" \
  -H "Authorization: Bearer {token}"
```

## 6. 快捷标签

### 6.1 获取快捷标签

**接口地址:** `GET /mobile/tags/quick`

**描述:** 获取酒店快捷标签列表

**请求参数:** 无

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
    "tags": [
      {"name": "亲子友好", "count": 45},
      {"name": "免费停车场", "count": 80},
      {"name": "含早餐", "count": 60},
      {"name": "免费WiFi", "count": 100},
      {"name": "商务中心", "count": 55},
      {"name": "健身房", "count": 50},
      {"name": "宠物友好", "count": 20},
      {"name": "游泳池", "count": 30}
    ]
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| facilities | array | 设施选项 |
| facilities[].id | string | 设施ID |
| facilities[].name | string | 设施名称 |
| facilities[].count | number | 数量 |
| services | array | 服务选项 |
| services[].id | string | 服务ID |
| services[].name | string | 服务名称 |
| services[].count | number | 数量 |
| tags | array | 快捷标签列表（来自附近酒店的tags） |
| tags[].name | string | 标签名称 |
| tags[].count | number | 数量 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权，请先登录 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/mobile/tags/quick" \
  -H "Authorization: Bearer {token}"
```