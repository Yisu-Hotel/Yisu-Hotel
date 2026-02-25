# 手机端 API 接口文档 - 酒店列表页

## 目录

- [基础信息](#基础信息)
- [酒店列表](#hotellist)
- [筛选管理](#filtramanagement)
- [排序管理](#sortmanagement)
- [收藏操作](#favoriteoperation)

## 1. 基础信息

- 基础URL: `http://localhost:{PORT}`
- 认证方式: Bearer Token（所有接口需在请求头中携带 `Authorization: Bearer {token}`）
- 字符集: UTF-8
- 时区: UTC

## 2. 酒店列表

### 2.1 获取酒店列表

复用 M-api-document2.md 中的 4.1 综合搜索酒店接口

## 3. 筛选管理

### 3.1 应用筛选条件

复用 M-api-document2.md 中的 4.1 综合搜索酒店接口

**说明：** 通过调用综合搜索接口，将筛选条件作为查询参数传递（例如：价格范围、星级、标签等），即可实现筛选功能。

## 4. 排序管理

### 4.1 应用排序

复用 M-api-document2.md 中的 4.1 综合搜索酒店接口

**说明：** 通过调用综合搜索接口，将排序方式作为 `sort_by` 查询参数传递，即可实现排序功能。

**关联参数：** 参考 M-api-document2.md 中的综合搜索接口参数 `sort_by`（第 275-300 行），支持以下排序方式：
- `price_asc` - 价格从低到高
- `price_desc` - 价格从高到低
- `distance_asc` - 距离由近及远
- `rating_desc` - 评分从高到低

**前端实现：** 排序选项可通过纯前端实现，无需后端接口支持。

## 5. 收藏操作

### 5.1 收藏酒店

**接口地址:** `POST /mobile/favorites/add`

**描述:** 收藏酒店

**请求参数:** 无

**请求头:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer {token} |
| Content-Type | string | 是 | application/json |

**请求体:**
```json
{
  "hotel_id": "hotel_001"
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| hotel_id | string | 是 | 酒店ID |

**响应示例:**
```json
{
  "code": 0,
  "msg": "收藏成功",
  "data": {
    "hotel_id": "hotel_001",
    "is_favorite": true,
    "favorite_count": 568
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID |
| is_favorite | boolean | 是否收藏 |
| favorite_count | number | 收藏数 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权，请先登录 |
| 4006 | 酒店不存在 |
| 4007 | 已收藏该酒店 |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/mobile/favorites/add" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"hotel_id": "hotel_001"}'
```

### 5.2 取消收藏

**接口地址:** `POST /mobile/favorites/remove`

**描述:** 取消收藏酒店

**请求参数:** 无

**请求头:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer {token} |
| Content-Type | string | 是 | application/json |

**请求体:**
```json
{
  "hotel_id": "hotel_001"
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| hotel_id | string | 是 | 酒店ID |

**响应示例:**
```json
{
  "code": 0,
  "msg": "取消收藏成功",
  "data": {
    "hotel_id": "hotel_001",
    "is_favorite": false,
    "favorite_count": 566
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID |
| is_favorite | boolean | 是否收藏 |
| favorite_count | number | 收藏数 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 401 | 未授权，请先登录 |
| 4006 | 酒店不存在 |
| 4008 | 未收藏该酒店 |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/mobile/favorites/remove" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"hotel_id": "hotel_001"}'
```