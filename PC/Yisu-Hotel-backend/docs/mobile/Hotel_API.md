# Yisu Hotel 移动端 酒店模块接口文档

本文档详细描述了移动端酒店查询相关的 API 接口，包括酒店列表的分页筛选查询及酒店完整详情的获取。

## 目录

- [基础信息](#1基础信息)
- [API 端点](#2api-端点)
  - [2.1 获取酒店列表](#21-获取酒店列表)
  - [2.2 获取酒店详情](#22-获取酒店详情)
  - [2.3 获取城市热门标签](#23-获取城市热门标签)

## 1.基础信息

- **基础URL**: `http://localhost:{PORT}/api/mobile/hotel`
- **数据格式**: `application/json`
- **鉴权**: 所有接口均需要 `Authorization` Header，值为 `Bearer <token>`。

## 2.API 端点

---

### 2.1 获取酒店列表

**接口地址:** `GET /list`

**描述:** 分页查询酒店列表，支持位置、星级、价格、评分、标签及关键词等多种维度的组合筛选。

**后端自动处理逻辑说明:**
1. **组合筛选逻辑**:
   - **基础维度**: 支持 `location` (城市)、`star_rating` (星级)、`rating` (最低评分) 的等值或范围过滤。
   - **价格筛选**: `max_min_price` 作用于房型表，筛选出在选定日期内平均起价不高于该值的酒店。
   - **集合属性**: `facilities`、`services` 和 `tags` 参数会通过数据库的 `JSONB` 或数组包含操作符进行匹配。
   - **周边匹配**: `nearby_info` 采用模糊匹配 (`LIKE` 或全文检索) 酒店的地理描述字段。
2. **关键词 (`keyword`) 综合搜索**:
   - 后端会将 `keyword` 作为一个通用的搜索项，同时匹配：酒店中文名、英文名、详细位置信息、所有标签内容以及周边信息。
   - 筛选逻辑通常采用 `OR` 连接各维度，确保搜索结果的广泛性和实用性。
3. **价格聚合**: 根据 `check_in_date` 和 `check_out_date`，实时计算并返回每个酒店符合条件房型的 `min_price` (最小平均价格)。

**请求头:**
```yaml
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数 (Query):**
| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| page | number | 否 | 页码，默认为 1 | 1 |
| pageSize | number | 否 | 每页记录数，默认为 10 | 10 |
| check_in_date | string | 是 | 入住日期 (YYYY-MM-DD) | "2026-02-14" |
| check_out_date | string | 是 | 离店日期 (YYYY-MM-DD) | "2026-02-15" |
| location | string | 否 | 城市或地区名称筛选 | "上海" |
| star_rating | number | 否 | 星级筛选 (1-5) | 5 |
| max_min_price | number | 否 | 能接收的最高的酒店最低价筛选 | 300 |
| rating | number | 否 | 最低评分筛选 (0-5) | 4.5 |
| facilities | array | 否 | 设施 ID 列表筛选 | ["wifi", "parking"] |
| services | array | 否 | 服务 ID 列表筛选 | ["reception"] |
| tags | array | 否 | 酒店标签列表筛选 | ["亲子友好", "含早餐"] |
| nearby_info | string | 否 | 周边信息关键词筛选 | "地铁" |
| keyword | string | 否 | 综合搜索关键词。可匹配酒店名称、位置、标签、周边信息等任意筛选维度 | "希尔顿" |

**请求示例:**
```bash
curl -X GET "http://localhost:{PORT}/api/mobile/hotel/list?location=上海&check_in_date=2026-02-14&check_out_date=2026-02-15&star_rating=5&page=1&pageSize=10&keyword=外滩" \
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
        "hotel_id": "550e8400-e29b-41d4-a716-446655440001",
        "hotel_name_cn": "易宿豪华酒店",
        "hotel_name_en": "Yisu Luxury Hotel",
        "star_rating": 5,
        "rating": 4.8,
        "nearby_info": "距离外滩步行5分钟",
        "main_image_url": ["http://example.com/h1.jpg"],
        "tags": ["外滩景观", "五星级"],
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
        "favorite_count": 1280,
        "average_rating": 4.8,
        "booking_count": 5600,
        "review_count": 890,
        "min_price": 899.00
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
| data.list | array | 酒店列表数据 |
| data.list[].hotel_id | string | 酒店唯一 ID (UUID) |
| data.list[].hotel_name_cn | string | 酒店中文名称 |
| data.list[].hotel_name_en | string | 酒店英文名称 |
| data.list[].star_rating | number | 酒店星级 (1-5) |
| data.list[].rating | number | 综合评分 (0-5) |
| data.list[].nearby_info | string | 周边交通/景点简述 |
| data.list[].main_image_url | array | 酒店主图 URL 列表 |
| data.list[].tags | array | 酒店标签列表 |
| data.list[].location_info | object | 地理位置详细信息 |
| data.list[].favorite_count | number | 累计被收藏次数 |
| data.list[].average_rating | number | 用户平均评价分 |
| data.list[].booking_count | number | 历史累计预定量 |
| data.list[].review_count | number | 累计评价条数 |
| data.list[].min_price | number | 该酒店所有房型在选定日期内的最小平均价格 |
| data.total | number | 符合筛选条件的酒店总数 |
| data.page | number | 当前页码 |
| data.pageSize | number | 每页展示条数 |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 请求成功 |
| 4008 | Token 无效或已过期 |
| 4009 | 参数格式不正确 |
| 500 | 服务器内部错误 |

---

### 2.2 获取酒店详情

**接口地址:** `GET /detail/:id`

**描述:** 根据酒店 ID 获取完整的酒店详细信息，包括基础资料、关联的设施服务、各项政策、所有可用房型及其实时房价、房型政策与标签，以及收藏与预定统计数据。

**后端自动处理逻辑说明:**
1. **多表数据拼接**:
   - 后端会以 `hotels` 表为主表，通过 `hotel_id` 关联 `hotel_rooms` (房型表)、`hotel_facilities` (设施关联表) 等多个表。
   - 提取酒店管理表中的基础信息（电话、描述、政策、位置快照等）并与房间表的详细内容进行结构化拼接。
2. **实时库存与价格**: 获取该酒店下所有房型的详细数据，并根据当前日期范围计算每个房型的展示价格列表。
3. **统计信息聚合**: 实时计算该酒店的 `favorite_count` 和 `booking_count` 等统计字段。

**请求头:**
```yaml
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数 (Path):**
| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| id | string | 是 | 酒店唯一 ID (UUID) | "550e8400-e29b-41d4-a716-446655440001" |

**请求示例:**
```bash
curl -X GET "http://localhost:{PORT}/api/mobile/hotel/detail/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "hotel_id": "550e8400-e29b-41d4-a716-446655440001",
    "hotel_name_cn": "易宿豪华酒店",
    "hotel_name_en": "Yisu Luxury Hotel",
    "star_rating": 5,
    "rating": 4.8,
    "review_count": 890,
    "description": "位于上海核心地段，尽享外滩美景...",
    "phone": "021-12345678",
    "opening_date": "2020-05-20",
    "nearby_info": "距离外滩步行5分钟",
    "main_image_url": ["http://example.com/h1.jpg"],
    "tags": ["外滩景观", "五星级"],
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
    "favorite_count": 1280,
    "booking_count": 5600,
    "facilities": [
      {"id": "wifi", "name": "免费WiFi"},
      {"id": "parking", "name": "免费停车场"}
    ],
    "services": [
      {"id": "reception", "name": "24小时前台"}
    ],
    "policies": {
      "cancellation": "入住前24小时免费取消",
      "payment": "支持信用卡及移动支付",
      "children": "12岁以下免费入住",
      "pets": "不可携带宠物"
    },
    "room_types": [
      {
        "id": "room-uuid...",
        "room_type_name": "豪华大床房",
        "bed_type": "king",
        "area": 35,
        "description": "宽敞舒适，大屏景观窗...",
        "room_image_url": "http://example.com/room1.jpg",
        "tags": ["推荐", "高楼层"],
        "facilities": [{"id": "ac", "name": "空调"}],
        "services": [{"id": "room_service", "name": "送餐服务"}],
        "policies": {
          "cancellation": "不可取消",
          "payment": "在线支付",
          "children": "不允许携带儿童",
          "pets": "不允许携带宠物"
        },
        "prices": [
          {"date": "2026-02-13", "price": 899.00},
          {"date": "2026-02-14", "price": 1099.00}
        ]
      }
    ]
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data.hotel_id | string | 酒店唯一 ID (UUID) |
| data.hotel_name_cn | string | 酒店中文名称 |
| data.hotel_name_en | string | 酒店英文名称 |
| data.star_rating | number | 酒店星级 (1-5) |
| data.rating | number | 综合评分 (0-5) |
| data.review_count | number | 累计评价条数 |
| data.description | string | 酒店详细描述 |
| data.phone | string | 酒店联系电话 |
| data.opening_date | string | 开业日期 (YYYY-MM-DD) |
| data.nearby_info | string | 周边交通/景点简述 |
| data.main_image_url | array | 酒店主图 URL 列表 |
| data.tags | array | 酒店标签列表 |
| data.location_info | object | 地理位置详细信息 (含城市、地址、坐标等) |
| data.favorite_count | number | 累计被收藏次数 |
| data.booking_count | number | 历史累计预定量 |
| data.facilities | array | 酒店通用设施列表 (包含 ID 和名称) |
| data.services | array | 酒店通用服务列表 (包含 ID 和名称) |
| data.policies | object | 酒店通用政策 (取消、支付、儿童、宠物政策) |
| data.room_types | array | 房型列表数据 |
| data.room_types[].id | string | 房型唯一 ID |
| data.room_types[].room_type_name | string | 房型名称 |
| data.room_types[].bed_type | string | 床型描述 |
| data.room_types[].area | number | 房间面积 (平方米) |
| data.room_types[].room_image_url | string | 房型主图 URL |
| data.room_types[].tags | array | 房型专属标签 |
| data.room_types[].facilities | array | 房型专属设施列表 |
| data.room_types[].services | array | 房型专属服务列表 |
| data.room_types[].policies | object | 房型专属政策 (覆盖酒店通用政策) |
| data.room_types[].prices | array | 该房型未来 30 天内的每日价格列表 |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 请求成功 |
| 4008 | Token 无效或已过期 |
| 4010 | 酒店不存在 |
| 500 | 服务器内部错误 |

---

### 2.3 获取城市热门标签与周边信息

**接口地址:** `GET /tags`

**描述:** 根据指定的城市名称，查询该城市下所有酒店关联的标签及周边信息。后端会进行去重，并分别返回热门的 10 个标签和 10 条周边信息，用于前端首页的快速跳转。

**后端自动处理逻辑说明:**
1. **城市过滤**: 后端会解析 `Hotel` 表中的 `location_info` 字段，筛选出 `city` 与传入参数匹配的所有酒店记录。
2. **数据提取与去重**: 
   - 从符合条件的酒店记录中，提取所有的 `tags` 数组内容和 `nearby_info` 文本。
   - 对提取到的内容进行全局去重处理。
3. **数量限制**: 分别从去重后的结果集中选取最多 10 个不同的标签 (`tags`) 和 10 条不同的周边信息 (`nearby_info`) 返回给前端。

**请求头:**
```yaml
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数 (Query):**
| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| city | string | 是 | 城市名称 | "上海" |

**请求示例:**
```bash
curl -X GET "http://localhost:{PORT}/api/mobile/hotel/tags?city=上海" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "tags": ["外滩景观", "五星级", "含早餐", "亲子友好", "精品酒店", "近地铁", "有停车场", "无烟房", "高楼层", "免费取消"],
    "nearby_info": ["外滩", "南京东路", "豫园", "人民广场", "东方明珠", "陆家嘴", "静安寺", "新天地", "田子坊", "上海博物馆"]
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data.tags | array | 聚合后的酒店标签列表（最多 10 个） |
| data.nearby_info | array | 聚合后的酒店周边信息列表（最多 10 个） |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 请求成功 |
| 4008 | Token 无效或已过期 |
| 4009 | 参数缺失（未提供城市名称） |
| 500 | 服务器内部错误 |
