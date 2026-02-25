# Yisu Hotel 移动端 用户模块接口文档

本文档详细描述了移动端用户个人资料管理相关的 API 接口。

## 目录

- [基础信息](#1基础信息)
- [API 端点](#2api-端点)
  - [2.1 获取个人信息](#21-获取个人信息)
  - [2.2 更新个人信息](#22-更新个人信息)

## 1.基础信息

- **基础URL**: `http://localhost:{PORT}/api/mobile/user`
- **数据格式**: `application/json`
- **鉴权**: 所有接口均需要 `Authorization` Header，值为 `Bearer <token>`。

## 2.API 端点

---

### 2.1 获取个人信息

**接口地址:** `GET /profile`

**描述:** 获取当前登录用户的详细个人资料。

**后端自动处理逻辑说明:**
1. **身份验证**: 解析 `Authorization` Token 提取 `user_id`。
2. **数据检索**: 从 `users` 表中查询该用户的基本信息（手机号、昵称、性别、生日、头像 URL）。
3. **响应返回**: 将查询到的数据结构化返回给前端。

**请求参数:** 无

**请求头:**
```yaml
Authorization: Bearer {token}
Content-Type: application/json
```

**请求示例:**
```bash
curl -X GET http://localhost:{PORT}/api/mobile/user/profile \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "phone": "13800138000",
    "nickname": "MyNickname",
    "gender": "男",
    "birthday": "1990-01-01",
    "avatar": "http://example.com/avatar.jpg"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data.id | string | 用户ID (UUID) |
| data.phone | string | 手机号 |
| data.nickname | string | 昵称 |
| data.gender | string | 性别: '男', '女', '保密' |
| data.birthday | string | 生日，格式 YYYY-MM-DD |
| data.avatar | string | 头像URL |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 请求成功 |
| 4008 | Token 无效或已过期 |
| 500 | 服务器内部错误 |

---

### 2.2 更新个人信息

**接口地址:** `PUT /profile`

**描述:** 更新当前登录用户的个人资料。

**后端自动处理逻辑说明:**
1. **身份验证**: 解析 `Authorization` Token 提取 `user_id`。
2. **头像 Base64 处理**:
   - 若请求中包含 `avatar_base64`，后端将解析该字符串（如 `data:image/png;base64,...`）。
   - **文件转换**: 将 Base64 数据解码并转换为 `.jpeg` 格式的图片文件。
   - **本地存储**: 将图片保存至前端项目的 `public` 目录下（如 `public/uploads/avatars/`），以便浏览器直接访问。
   - **URL 生成**: 拼接可访问的图片 URL（例如 `http://localhost:3000/uploads/avatars/user_uuid.jpeg`）。
3. **数据持久化**: 
   - 将生成的头像 URL 以及用户修改的 `nickname`、`gender`、`birthday` 等信息更新至数据库中的 `users` 表。
4. **响应**: 返回更新后的完整用户信息。

**请求头:**
```yaml
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数:** 无

**请求体:**
```json
{
  "nickname": "NewNick",
  "gender": "男",
  "birthday": "1990-01-01",
  "avatar_base64": "data:image/png;base64,xxxx"
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| nickname | string | 否 | 昵称，2-50字符 | "NewNick" |
| gender | string | 否 | 性别: '男', '女', '保密' | "男" |
| birthday | string | 否 | 生日，格式 YYYY-MM-DD | "1990-01-01" |
| avatar_base64 | string | 否 | 头像Base64字符串，最大2MB | "data:image..." |

**请求示例:**
```bash
curl -X PUT http://localhost:{PORT}/api/mobile/user/profile \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "NewNick",
    "gender": "男",
    "birthday": "1990-01-01",
    "avatar_base64": "data:image/png;base64,xxxx"
  }'
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "更新成功",
  "data": {
    "nickname": "NewNick",
    "gender": "男",
    "birthday": "1990-01-01",
    "avatar": "http://example.com/new_avatar.jpg"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data.nickname | string | 更新后的昵称 |
| data.gender | string | 更新后的性别 |
| data.birthday | string | 更新后的生日 |
| data.avatar | string | 更新后的头像URL |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 请求成功 |
| 4008 | Token 无效或已过期 |
| 4017 | 资料格式不正确 |
| 500 | 服务器内部错误 |
