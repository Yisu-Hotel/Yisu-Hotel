# 管理员酒店审核/发布/下线 API 接口文档

## 目录

- [基础信息](#基础信息)
- [审核列表管理](#审核列表管理)
- [审核操作](#审核操作)
- [发布/下线管理](#发布下线管理)
- [审核日志](#审核日志)

## 1. 基础信息

- 基础URL: `http://localhost:{PORT}`
- 认证方式: Bearer Token（所有接口需在请求头中携带 `Authorization: Bearer {token}`）
- 角色权限: 仅管理员角色可访问

## 2. 审核列表管理

### 2.1 获取审核列表

**接口地址:** `GET /admin/hotel/audit-list`

**描述:** 分页查询待审核酒店列表（管理员端，返回所有提交审核的酒店）

**请求参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| page_size | int | 否 | 每页数量，默认 10 |
| status | string | 否 | 状态筛选：pending（待审核）、auditing（审核中）、approved（已通过）、rejected（已拒绝） |
| start_date | string | 否 | 开始时间（格式：YYYY-MM-DD） |
| end_date | string | 否 | 结束时间（格式：YYYY-MM-DD） |
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
    "total": 25,
    "page": 1,
    "page_size": 10,
    "list": [
      {
        "hotel_id": "550e8400-e29b-41d4-a716-446655440001",
        "hotel_name_cn": "易宿酒店",
        "hotel_name_en": "Yisu Hotel",
        "submitted_at": "2026-02-05T10:00:00.000Z",
        "submitted_by": "550e8400-e29b-41d4-a716-446655440000",
        "status": "pending",
        "status_text": "待审核"
      },
      {
        "hotel_id": "550e8400-e29b-41d4-a716-446655440002",
        "hotel_name_cn": "阳光酒店",
        "hotel_name_en": "Sunshine Hotel",
        "submitted_at": "2026-02-04T14:00:00.000Z",
        "submitted_by": "550e8400-e29b-41d4-a716-446655440001",
        "status": "approved",
        "status_text": "已通过",
        "audited_at": "2026-02-05T09:00:00.000Z",
        "audited_by": "550e8400-e29b-41d4-a716-446655440001"
      },
      {
        "hotel_id": "550e8400-e29b-41d4-a716-446655440003",
        "hotel_name_cn": "星空酒店",
        "hotel_name_en": "Star Hotel",
        "submitted_at": "2026-02-03T16:00:00.000Z",
        "submitted_by": "550e8400-e29b-41d4-a716-446655440002",
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
| list | array | 审核列表 |
| list[].hotel_id | string | 酒店ID |
| list[].hotel_name_cn | string | 酒店中文名称 |
| list[].hotel_name_en | string | 酒店英文名称 |
| list[].submitted_at | string | 提交时间 |
| list[].submitted_by | string | 提交人ID |
| list[].status | string | 状态：pending（待审核）、auditing（审核中）、approved（已通过）、rejected（已拒绝） |
| list[].status_text | string | 状态文本 |
| list[].audited_at | string | 审核时间（已审核时返回） |
| list[].audited_by | string | 审核人ID（已审核时返回） |
| list[].reject_reason | string | 拒绝原因（被拒绝时返回） |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |
| 4009 | 参数格式不正确 |
| 4019 | 无权限访问此接口 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/admin/hotel/audit-list?page=1&page_size=10&status=pending&start_date=2026-02-01&end_date=2026-02-05" \
  -H "Authorization: Bearer {token}"
```

---

### 2.2 获取审核统计

**接口地址:** `GET /admin/hotel/audit-stats`

**描述:** 获取今日审核统计数据

**请求参数:** 无

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
    "pending_count": 8,
    "approved_count": 15,
    "offline_count": 2
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| pending_count | int | 今日待审核数量 |
| approved_count | int | 今日已通过数量 |
| offline_count | int | 今日已下线数量 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |
| 4019 | 无权限访问此接口 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/admin/hotel/audit-stats" \
  -H "Authorization: Bearer {token}"
```

---

### 2.3 获取酒店详情

**接口地址:** `GET /admin/hotel/detail/:id`

**描述:** 根据酒店ID获取详细信息（用于审核）

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
    "formatted_address": "北京市朝阳区建国路88号",
    "address_component": {
      "country": "中国",
      "province": "北京市",
      "city": "北京市",
      "district": "朝阳区",
      "street": "建国路",
      "street_number": "88号"
    },
    "star_rating": 4,
    "room_prices": [
      {
        "room_type": "大床房",
        "price": 299.00
      },
      {
        "room_type": "双床房",
        "price": 329.00
      },
      {
        "room_type": "套房",
        "price": 599.00
      }
    ],
    "opening_date": "2020-01-01",
    "nearby_info": "距离地铁站500米，周边有商场、餐厅",
    "promotion_scenario": "节日优惠",
    "status": "pending",
    "submitted_at": "2026-02-05T10:00:00.000Z",
    "submitted_by": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID |
| hotel_name_cn | string | 酒店中文名称 |
| hotel_name_en | string | 酒店英文名称 |
| formatted_address | string | 完整地址 |
| address_component | object | 地址组件 |
| star_rating | int | 酒店星级 |
| room_prices | array | 房型价格列表 |
| room_prices[].room_type | string | 房型名称 |
| room_prices[].price | number | 房型价格 |
| opening_date | string | 开业时间 |
| nearby_info | string | 周边信息 |
| promotion_scenario | string | 优惠场景 |
| status | string | 状态 |
| submitted_at | string | 提交时间 |
| submitted_by | string | 提交人ID |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |
| 4010 | 酒店不存在 |
| 4019 | 无权限访问此接口 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/admin/hotel/detail/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer {token}"
```

## 3. 审核操作

### 3.1 审核通过

**接口地址:** `POST /admin/hotel/approve/:id`

**描述:** 审核通过酒店信息

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
  "msg": "审核通过成功",
  "data": {
    "hotel_id": "550e8400-e29b-41d4-a716-446655440001",
    "status": "approved",
    "audited_at": "2026-02-05T14:00:00.000Z"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID |
| status | string | 状态：approved（已通过） |
| audited_at | string | 审核时间 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |
| 4010 | 酒店不存在 |
| 4019 | 无权限访问此接口 |
| 4020 | 酒店状态不允许审核 |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/admin/hotel/approve/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer {token}"
```

---

### 3.2 审核拒绝

**接口地址:** `POST /admin/hotel/reject/:id`

**描述:** 审核拒绝酒店信息

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
  "reject_reason": "酒店信息不完整，请补充周边信息"
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| reject_reason | string | 是 | 拒绝原因 |

**响应示例:**
```json
{
  "code": 0,
  "msg": "审核拒绝成功",
  "data": {
    "hotel_id": "550e8400-e29b-41d4-a716-446655440001",
    "status": "rejected",
    "audited_at": "2026-02-05T14:00:00.000Z"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID |
| status | string | 状态：rejected（已拒绝） |
| audited_at | string | 审核时间 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |
| 4001 | 拒绝原因不能为空 |
| 4010 | 酒店不存在 |
| 4019 | 无权限访问此接口 |
| 4020 | 酒店状态不允许审核 |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/admin/hotel/reject/550e8400-e29b-41d4-a716-446655440001" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"reject_reason": "酒店信息不完整，请补充周边信息"}'
```

---

### 3.3 批量审核

**接口地址:** `POST /admin/hotel/batch-audit`

**描述:** 批量审核酒店（通过或拒绝）

**请求参数:** 无

**请求头:**
```
Authorization: Bearer {token}
```

**请求体:**
```json
{
  "hotel_ids": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002",
    "550e8400-e29b-41d4-a716-446655440003"
  ],
  "action": "approve"
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| hotel_ids | array | 是 | 酒店ID列表 |
| action | string | 是 | 操作类型：approve（通过）、reject（拒绝） |
| reject_reason | string | 否 | 拒绝原因（action为reject时必填） |

**响应示例:**
```json
{
  "code": 0,
  "msg": "批量审核成功",
  "data": {
    "success_count": 3,
    "failed_count": 0
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| success_count | int | 成功数量 |
| failed_count | int | 失败数量 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |
| 4001 | 拒绝原因不能为空 |
| 4019 | 无权限访问此接口 |
| 4021 | 批量操作数量超限 |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/admin/hotel/batch-audit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "hotel_ids": [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002",
      "550e8400-e29b-41d4-a716-446655440003"
    ],
    "action": "approve"
  }'
```

## 4. 发布/下线管理

### 4.1 发布酒店

**接口地址:** `POST /admin/hotel/publish/:id`

**描述:** 将已通过的酒店发布到移动端

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
  "msg": "发布成功，已同步至移动端",
  "data": {
    "hotel_id": "550e8400-e29b-41d4-a716-446655440001",
    "status": "published",
    "published_at": "2026-02-05T15:00:00.000Z"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID |
| status | string | 状态：published（已发布） |
| published_at | string | 发布时间 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |
| 4010 | 酒店不存在 |
| 4019 | 无权限访问此接口 |
| 4022 | 酒店状态不允许发布 |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/admin/hotel/publish/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer {token}"
```

---

### 4.2 下线酒店

**接口地址:** `POST /admin/hotel/offline/:id`

**描述:** 下线酒店（需二次确认）

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
  "msg": "下线成功",
  "data": {
    "hotel_id": "550e8400-e29b-41d4-a716-446655440001",
    "status": "offline",
    "offline_at": "2026-02-05T16:00:00.000Z"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID |
| status | string | 状态：offline（已下线） |
| offline_at | string | 下线时间 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |
| 4010 | 酒店不存在 |
| 4019 | 无权限访问此接口 |
| 4023 | 酒店状态不允许下线 |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/admin/hotel/offline/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer {token}"
```

---

### 4.3 恢复酒店

**接口地址:** `POST /admin/hotel/restore/:id`

**描述:** 恢复已下线的酒店，重新发布至移动端

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
  "msg": "恢复成功，已重新发布至移动端",
  "data": {
    "hotel_id": "550e8400-e29b-41d4-a716-446655440001",
    "status": "published",
    "restored_at": "2026-02-05T17:00:00.000Z"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID |
| status | string | 状态：published（已发布） |
| restored_at | string | 恢复时间 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |
| 4010 | 酒店不存在 |
| 4019 | 无权限访问此接口 |
| 4024 | 酒店状态不允许恢复 |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/admin/hotel/restore/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer {token}"
```

---

### 4.4 批量发布/下线

**接口地址:** `POST /admin/hotel/batch-publish`

**描述:** 批量发布或下线酒店

**请求参数:** 无

**请求头:**
```
Authorization: Bearer {token}
```

**请求体:**
```json
{
  "hotel_ids": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002",
    "550e8400-e29b-41d4-a716-446655440003"
  ],
  "action": "publish"
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| hotel_ids | array | 是 | 酒店ID列表 |
| action | string | 是 | 操作类型：publish（发布）、offline（下线） |

**响应示例:**
```json
{
  "code": 0,
  "msg": "批量操作成功",
  "data": {
    "success_count": 3,
    "failed_count": 0
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| success_count | int | 成功数量 |
| failed_count | int | 失败数量 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |
| 4019 | 无权限访问此接口 |
| 4021 | 批量操作数量超限 |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/admin/hotel/batch-publish" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "hotel_ids": [
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002",
      "550e8400-e29b-41d4-a716-446655440003"
    ],
    "action": "publish"
  }'
```

## 5. 审核日志

### 5.1 获取审核日志

**接口地址:** `GET /admin/hotel/audit-log/:id`

**描述:** 查看酒店最近一次审核记录

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
    "logs": [
      {
        "audit_id": "audit_001",
        "auditor": "550e8400-e29b-41d4-a716-446655440001",
        "audited_at": "2026-02-05T14:00:00.000Z",
        "result": "approved",
        "result_text": "已通过",
        "reject_reason": null
      },
      {
        "audit_id": "audit_002",
        "auditor": "550e8400-e29b-41d4-a716-446655440001",
        "audited_at": "2026-02-04T10:00:00.000Z",
        "result": "rejected",
        "result_text": "已拒绝",
        "reject_reason": "酒店信息不完整，请补充周边信息"
      }
    ]
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| hotel_id | string | 酒店ID |
| hotel_name_cn | string | 酒店名称 |
| logs | array | 审核日志列表 |
| logs[].audit_id | string | 审核记录ID |
| logs[].auditor | string | 审核人ID |
| logs[].audited_at | string | 审核时间 |
| logs[].result | string | 审核结果：approved（通过）、rejected（拒绝） |
| logs[].result_text | string | 审核结果文本 |
| logs[].reject_reason | string | 拒绝原因（被拒绝时返回，通过时为null） |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |
| 4010 | 酒店不存在 |
| 4019 | 无权限访问此接口 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/admin/hotel/audit-log/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer {token}"
```