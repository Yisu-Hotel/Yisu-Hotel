# Yisu Hotel 移动端 广告模块接口文档

本文档详细描述了移动端首页轮播图及广告展示相关的 API 接口。

## 目录

- [基础信息](#1基础信息)
- [API 端点](#2api-端点)
  - [2.1 获取广告列表](#21-获取广告列表)

## 1.基础信息

- **基础URL**: `http://localhost:{PORT}/api/mobile/banner`
- **数据格式**: `application/json`
- **鉴权**: 该接口为公开接口，无需 `Authorization` Header（可选）。

## 2.API 端点

---

### 2.1 获取广告列表

**接口地址:** `GET /list`

**描述:** 获取当前处于启用状态且在有效期内的轮播图广告列表。

**后端处理逻辑:**
1. **状态过滤**: 仅查询数据库中 `status` 为 `active`（已启用）的广告记录。
2. **有效期校验**: 后端自动比对当前系统时间与广告的 `start_time`（开始时间）和 `end_time`（结束时间），确保广告处于有效期内。
3. **排序逻辑**: 根据广告的 `priority`（权重/优先级）字段进行降序排列，确保重要广告优先展示。
4. **数据清洗**: 过滤掉非必要字段，仅返回前端展示和跳转所需的关键数据（如图片 URL、跳转类型及目标 ID）。

**请求头:**
```yaml
Content-Type: application/json
```

**请求参数:** 无

**请求示例:**
```bash
curl -X GET http://localhost:{PORT}/api/mobile/banner/list \
  -H "Content-Type: application/json"
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": [
    {
      "image_url": "http://example.com/banner1.jpg",
      "title": "春季特惠活动",
      "description": "全场酒店5折起，限时开启！",
      "target_type": "promotion",
      "target_id": "promo-uuid-123",
      "url": "http://example.com/activity/spring"
    },
    {
      "image_url": "http://example.com/banner2.jpg",
      "title": "希尔顿酒店专属折扣",
      "description": "新用户首单立减100元",
      "target_type": "hotel",
      "target_id": "hotel-uuid-456",
      "url": ""
    }
  ]
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data | array | 广告列表数据 |
| data[].image_url | string | 广告图片 URL 地址 |
| data[].title | string | 广告标题 |
| data[].description | string | 广告详细描述或副标题 |
| data[].target_type | string | 跳转类型: `hotel` (酒店详情), `promotion` (活动页), `url` (外部链接) |
| data[].target_id | string | 跳转目标的唯一标识 ID（如酒店 ID 或活动 ID） |
| data[].url | string | 外部跳转链接（当 target_type 为 url 时有效） |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 请求成功 |
| 500 | 服务器内部错误 |
