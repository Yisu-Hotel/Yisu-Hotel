# API 接口文档

## 目录

- [基础信息](#基础信息)
- [API 端点](#api-端点)
- [用户认证](#用户认证)
- [用户资料管理](#用户资料管理)

## 1.基础信息

- 基础URL: `http://localhost:{PORT}`

## 2.API 端点

### 2.1. 服务状态检查

**接口地址:** `GET /api/status`

**描述:** 检查 Express 后端服务是否正常运行

**请求参数:** 无

**响应示例:**
```json
{
  "code": 200,
  "msg": "Express后端服务启动成功！",
  "data": null
}
```

**响应字段说明:**
- `code`: 响应状态码，200 表示成功
- `msg`: 响应消息
- `data`: 响应数据，此接口为 null

**curl 示例:**
```bash
curl -X GET http://localhost:{PORT}/api/status
```

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 500 | 服务器内部错误 |

---

### 2.2. 前后端连通性测试

**接口地址:** `GET /api/test`

**描述:** 测试前后端连接是否正常

**请求参数:** 无

**响应示例:**
```json
{
  "code": 200,
  "msg": "前后端连通性测试成功",
  "data": {
    "timestamp": "2026-02-03T12:00:00.000Z",
    "method": "GET",
    "path": "/api/test"
  }
}
```

**响应字段说明:**
- `code`: 响应状态码，200 表示成功
- `msg`: 响应消息
- `data`: 响应数据对象
  - `timestamp`: 请求时间戳（ISO 8601格式）
  - `method`: HTTP请求方法
  - `path`: 请求路径

**curl 示例:**
```bash
curl -X GET http://localhost:{PORT}/api/test
```

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 500 | 服务器内部错误 |

## 3. 用户认证

### 3.1 账号唯一性校验

**接口地址:** `POST /auth/check-account`

**描述:** 校验账号（手机号）是否已被注册

**请求参数:** 无

**请求体:**
```json
{
  "phone": "13800138000"
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| phone | string | 是 | 手机号 |

**响应示例（账号可用）:**
```json
{
  "code": 0,
  "msg": "账号可用",
  "data": {
    "available": true
  }
}
```

**响应示例（账号已存在）:**
```json
{
  "code": 0,
  "msg": "该账号已被注册",
  "data": {
    "available": false
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| available | boolean | 账号是否可用，true 表示可用，false 表示已被注册 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 3001 | 手机号格式不正确 |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/auth/check-account" \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000"}'
```

---

### 3.2 发送验证码

**接口地址:** `POST /auth/send-code`

**描述:** 发送验证码到手机或邮箱

**请求参数:** 无

**请求体:**
```json
{
  "phone": "13800138000",
  "type": "register"
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| phone | string | 是 | 手机号 |
| type | string | 是 | 验证码类型：register（注册）、login（登录）、reset（重置密码） |

**响应示例:**
```json
{
  "code": 0,
  "msg": "验证码已发送",
  "data": {
    "expires_in": 60
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| expires_in | int | 验证码有效期（秒） |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 3001 | 手机号格式不正确 |
| 3002 | 验证码发送频率限制（60秒内只能发送一次） |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/auth/send-code" \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "type": "register"}'
```

---

### 3.3 注册

**接口地址:** `POST /auth/register`

**描述:** 商户/管理员账号注册

**请求参数:** 无

**请求体:**
```json
{
  "phone": "13800138000",
  "password": "123456",
  "code": "123456",
  "role": "merchant",
  "agreed": true
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| phone | string | 是 | 手机号 |
| password | string | 是 | 密码，6-20位字符 |
| code | string | 是 | 验证码，6 位数字 |
| role | string | 是 | 角色：merchant（商户）、admin（管理员），默认 merchant |
| agreed | boolean | 是 | 是否同意用户协议与隐私政策 |

**响应示例:**
```json
{
  "code": 0,
  "msg": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "account": "13800138000",
      "role": "merchant"
    }
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| token | string | JWT 认证令牌 |
| user | object | 用户信息 |
| user.id | string | 用户 ID（UUID） |
| user.account | string | 手机号 |
| user.role | string | 角色：merchant（商户）、admin（管理员） |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 3001 | 手机号格式不正确 |
| 3003 | 验证码错误或已过期 |
| 3004 | 未同意用户协议 |
| 3005 | 手机号已被注册 |
| 3006 | 密码格式不正确 |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "password": "123456", "code": "123456", "role": "merchant", "agreed": true}'
```

---

### 3.4 登录

**接口地址:** `POST /auth/login`

**描述:** 账号密码登录

**请求参数:** 无

**请求体:**
```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| phone | string | 是 | 手机号 |
| password | string | 是 | 密码 |

**响应示例:**
```json
{
  "code": 0,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "account": "13800138000",
      "role": "merchant",
      "profile": {
        "nickname": "张三"
      }
    }
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| token | string | JWT 认证令牌 |
| user | object | 用户信息 |
| user.id | string | 用户 ID（UUID） |
| phone | string | 手机号 |
| user.role | string | 角色：merchant（商户）、admin（管理员） |
| user.profile | object | 用户资料 |
| user.profile.nickname | string | 昵称 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 3007 | 手机号不存在 |
| 3008 | 密码错误 |
| 3009 | 手机号已被禁用 |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "password": "123456"}'
```

---

### 3.5 忘记密码

**接口地址:** `POST /auth/forgot-password`

**描述:** 忘记密码，发送验证码到绑定账号

**请求参数:** 无

**请求体:**
```json
{
  "phone": "13800138000"
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| phone | string | 是 | 手机号 |

**响应示例:**
```json
{
  "code": 0,
  "msg": "验证码已发送",
  "data": {
    "expires_in": 60
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| expires_in | int | 验证码有效期（秒） |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 3001 | 手机号格式不正确 |
| 3007 | 手机号不存在 |
| 3002 | 验证码发送频率限制（60秒内只能发送一次） |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000"}'
```

---

### 3.6 重置密码

**接口地址:** `POST /auth/reset-password`

**描述:** 通过验证码重置密码

**请求参数:** 无

**请求体:**
```json
{
  "account": "13800138000",
  "code": "123456",
  "new_password": "123456"
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| phone | string | 是 | 手机号 |
| code | string | 是 | 验证码，6 位数字 |
| new_password | string | 是 | 新密码，6-20位字符 |

**响应示例:**
```json
{
  "code": 0,
  "msg": "密码重置成功",
  "data": null
}
```

**响应字段说明:** 无

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 3001 | 手机号格式不正确 |
| 3003 | 验证码错误或已过期 |
| 3006 | 密码格式不正确 |
| 3007 | 手机号不存在 |

**curl 示例:**
```bash
curl -X POST "http://localhost:{PORT}/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "code": "123456", "new_password": "123456"}'
```

---

## 4. 用户资料管理

### 4.1 获取用户资料

**接口地址:** `GET /user/profile`

**描述:** 获取当前登录用户的资料信息

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
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "account": "13800138000",
    "role": "merchant",
    "nickname": "张三",
    "gender": "男",
    "birthday": "1995-05-20",
    "avatar": "https://example.com/avatar.jpg",
    "avatar_base64": "data:image/png;base64,xxxx",
    "created_at": "2026-01-01T10:00:00.000Z",
    "updated_at": "2026-02-05T10:00:00.000Z"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | 用户ID（UUID） |
| account | string | 手机号 |
| role | string | 角色：merchant（商户）、admin（管理员） |
| nickname | string | 昵称 |
| gender | string | 性别（男、女、保密） |
| birthday | string | 生日（YYYY-MM-DD） |
| avatar | string | 头像URL |
| avatar_base64 | string | 头像Base64 |
| created_at | string | 创建时间 |
| updated_at | string | 更新时间 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |

**curl 示例:**
```bash
curl -X GET "http://localhost:{PORT}/user/profile" \
  -H "Authorization: Bearer {token}"
```

---

### 4.2 更新用户资料

**接口地址:** `PUT /user/profile`

**描述:** 更新当前登录用户的资料信息

**请求参数:** 无

**请求头:**
```
Authorization: Bearer {token}
```

**请求体:**
```json
{
  "nickname": "李四",
  "gender": "男",
  "birthday": "1995-05-20",
  "avatar": "https://example.com/avatar.jpg",
  "avatar_base64": "data:image/png;base64,xxxx"
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nickname | string | 否 | 用户昵称，长度2-50字符 |
| gender | string | 否 | 性别（男、女、保密） |
| birthday | string | 否 | 生日（YYYY-MM-DD） |
| avatar | string | 否 | 头像URL |
| avatar_base64 | string | 否 | 头像Base64 |

**响应示例:**
```json
{
  "code": 0,
  "msg": "更新成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "updated_at": "2026-02-05T15:00:00.000Z"
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | 用户ID（UUID） |
| updated_at | string | 更新时间 |

**错误码:**
| 错误码 | 说明 |
|--------|------|
| 4008 | Token 无效或已过期 |
| 4017 | 昵称格式不正确 |

**curl 示例:**
```bash
curl -X PUT "http://localhost:{PORT}/user/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"nickname": "李四", "gender": "男", "birthday": "1995-05-20", "avatar": "https://example.com/avatar.jpg", "avatar_base64": "data:image/png;base64,xxxx"}'
```
