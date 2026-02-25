# Yisu Hotel 移动端 收藏模块接口文档

本文档详细描述了移动端用户收藏管理相关的 API 接口，包括添加收藏、取消收藏及获取收藏列表。

## 目录

- [1.基础信息](#1基础信息)
- [2.API 端点](#2api-端点)
  - [2.1 添加收藏](#21-添加收藏)
  - [2.2 取消收藏](#22-取消收藏)
  - [2.3 获取收藏列表](#23-获取收藏列表)

## 1.基础信息

- **基础URL**: `http://localhost:{PORT}/api/mobile/favorite`
- **数据格式**: `application/json`
- **鉴权**: 所有接口均需要 `Authorization` Header，值为 `Bearer <token>`。

## 2.API 端点

---

### 2.1 添加收藏

**接口地址:** `POST /add`

**描述:** 将指定的酒店添加到用户的收藏列表中。

**后端自动处理逻辑说明:**
1. **身份验证**: 从 Token 中提取 `user_id`。
2. **合法性检查**: 验证 `hotel_id` 对应的酒店是否存在于 `hotels` 表中。
3. **重复性校验**: 检查 `favorites` 表，确保该用户尚未收藏过该酒店。
4. **持久化**: 向 `favorites` 表插入新记录，并记录收藏时间 `created_at`。

**请求头:**
```yaml
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体:**
```json
{
  "hotel_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| hotel_id | string | 是 | 酒店唯一 ID (UUID) | "550e8400-e29b-41d4-a716-446655440000" |

**请求示例:**
```bash
curl -X POST http://localhost:{PORT}/api/mobile/favorite/add \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"hotel_id": "550e8400-e29b-41d4-a716-446655440000"}'
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "收藏成功",
  "data": {
    "id": "fav-uuid...",
    "created_at": "2026-02-13T12:00:00.000Z"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data.id | string | 收藏记录 ID |
| data.created_at | string | 收藏时间 |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 成功 |
| 4008 | Token 无效或已过期 |
| 4011 | 酒店不存在 |
| 4012 | 已经收藏过该酒店 |
| 500 | 服务器内部错误 |

---

### 2.2 取消收藏

**接口地址:** `DELETE /remove`

**描述:** 从用户的收藏列表中移除指定的酒店。

**后端自动处理逻辑说明:**
1. **身份验证**: 从 Token 中提取 `user_id`。
2. **记录定位**: 在 `favorites` 表中查找同时匹配 `user_id` 和 `hotel_id` 的收藏记录。
3. **物理/逻辑删除**: 若记录存在，则将其从数据库中删除（或标记为已取消）。
4. **异常处理**: 若找不到对应收藏记录，则返回错误码 `4013`。

**请求头:**
```yaml
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体:**
```json
{
  "hotel_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| hotel_id | string | 是 | 酒店唯一 ID (UUID) | "550e8400-e29b-41d4-a716-446655440000" |

**请求示例:**
```bash
curl -X DELETE http://localhost:{PORT}/api/mobile/favorite/remove \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"hotel_id": "550e8400-e29b-41d4-a716-446655440000"}'
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "取消收藏成功",
  "data": null
}
```

**响应字段说明:** 无

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 成功 |
| 4008 | Token 无效或已过期 |
| 4013 | 尚未收藏该酒店 |
| 500 | 服务器内部错误 |

---

### 2.3 获取收藏列表

**接口地址:** `GET /list`

**描述:** 分页获取当前登录用户的收藏酒店列表，并包含酒店基本信息及最低价。

**后端自动处理逻辑说明:**
1. **身份验证**: 从 Token 中提取 `user_id`。
2. **多表关联查询**:
   - 核心查询：从 `favorites` 表中按 `user_id` 检索记录。
   - 关联酒店信息：通过 `hotel_id` 关联 `hotels` 表，获取酒店名、星级、评分、标签及位置信息。
   - 关联实时价格：通过 `hotel_rooms` 或价格汇总表，计算该酒店当前的 `min_price`。
3. **分页与排序**: 结合 `page` 和 `pageSize` 参数，通常按收藏时间 `favorite_at` 降序排列。

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

**请求示例:**
```bash
curl -X GET "http://localhost:{PORT}/api/mobile/favorite/list?page=1&pageSize=10" \
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
        "hotel_id": "550e8400-e29b-41d4-a716-446655440000",
        "hotel_name_cn": "示例豪华酒店",
        "hotel_name_en": "Example Luxury Hotel",
        "star_rating": 5,
        "rating": 4.8,
        "main_image_url": ["http://example.com/hotel1.jpg"],
        "tags": ["五星级", "近地铁", "有泳池"],
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
        "min_price": 599.00,
        "favorite_at": "2026-02-13T12:00:00.000Z"
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
| data.list | array | 收藏列表 |
| data.list[].hotel_id | string | 酒店 ID |
| data.list[].hotel_name_cn | string | 酒店中文名 |
| data.list[].hotel_name_en | string | 酒店英文名 |
| data.list[].star_rating | number | 星级 |
| data.list[].rating | number | 评分 |
| data.list[].main_image_url | array | 酒店主图列表 |
| data.list[].tags | array | 酒店标签 |
| data.list[].location_info | object | 位置信息 |
| data.list[].min_price | number | 该酒店当前的最低起价 |
| data.list[].favorite_at | string | 收藏时间 |
| data.total | number | 总记录数 |
| data.page | number | 当前页码 |
| data.pageSize | number | 每页记录数 |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 请求成功 |
| 4008 | Token 无效或已过期 |
| 500 | 服务器内部错误 |
