# Yisu Hotel 移动端 认证模块接口文档

本文档详细描述了移动端用户认证相关的 API 接口，包括验证码发送、注册、登录及密码重置功能。

## 目录

- [1.基础信息](#1基础信息)
- [2.API 端点](#2api-端点)
  - [2.1 发送验证码](#21-发送验证码)
  - [2.2 用户注册](#22-用户注册)
  - [2.3 用户登录](#23-用户登录)
  - [2.4 重置密码](#24-重置密码)

## 1.基础信息

- **基础URL**: `http://localhost:{PORT}/api/mobile/auth`
- **数据格式**: `application/json`
- **鉴权**: 注册、登录、发送验证码及重置密码接口均无需鉴权。

## 2.API 端点

---

### 2.1 发送验证码

**接口地址:** `POST /send-code`

**描述:** 向指定手机号发送短信验证码。

**后端处理逻辑:**
1. **格式校验**: 验证手机号是否符合 `1[3-9]\d{9}` 格式。
2. **频率限制**: 检查该手机号在短时间内（如 60s）是否已发送过验证码，防止恶意攻击。
3. **生成验证码**: 后端自动生成一个 6 位随机数字验证码。
4. **发送短信**: 调用 **阿里云 SMS 服务** 接口，将验证码发送至目标手机。
5. **持久化**: 将手机号、验证码、类型及过期时间写入数据库（或 Redis），用于后续校验。

**请求头:**
```yaml
Content-Type: application/json
```

**请求参数:** 无

**请求体:**
```json
{
  "phone": "13800138000",
  "type": "register"
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| phone | string | 是 | 手机号，需满足 `1[3-9]\d{9}` 格式 | "13800138000" |
| type | string | 否 | 验证码类型: `register` (注册), `login` (登录), `reset` (重置密码) | "register" |

**请求示例:**
```bash
curl -X POST http://localhost:{PORT}/api/mobile/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "type": "register"}'
```

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
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data.expires_in | number | 验证码有效时长（秒） |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 成功 |
| 3001 | 手机号格式不正确 |
| 3002 | 验证码发送频率限制 |
| 500 | 服务器内部错误 |

---

### 2.2 用户注册

**接口地址:** `POST /register`

**描述:** 使用手机号和验证码进行新用户注册。

**后端处理逻辑:**
1. **输入校验**: 验证手机号格式、验证码位数、密码复杂度以及是否同意协议。
2. **验证码校验**: 从数据库中查询该手机号对应的最新有效验证码，核对是否匹配且未过期。
3. **查重**: 检查该手机号是否已在 `users` 表中存在。
4. **持久化**: 将手机号、加密后的密码、默认昵称等信息写入数据库。
5. **自动登录**: 注册成功后，后端立即生成一个 **JWT Token**。
6. **响应**: 返回 Token 及基本用户信息，前端接收后可直接进入登录状态。

**请求头:**
```yaml
Content-Type: application/json
```

**请求参数:** 无

**请求体:**
```json
{
  "phone": "13800138000",
  "code": "123456",
  "password": "abc123456",
  "agreed": true
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| phone | string | 是 | 手机号 | "13800138000" |
| code | string | 是 | 6位短信验证码 | "123456" |
| password | string | 是 | 密码，6-16位，须包含字母和数字 | "abc123456" |
| agreed | boolean | 是 | 是否同意用户协议，必须为 true | true |

**请求示例:**
```bash
curl -X POST http://localhost:{PORT}/api/mobile/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "code": "123456", "password": "abc123456", "agreed": true}'
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "phone": "13800138000",
      "role": "mobile",
      "profile": {
        "nickname": "用户_138000"
      }
    }
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码 |
| msg | string | 提示信息 |
| data.token | string | 身份认证 Token (JWT) |
| data.user.id | string | 用户唯一 ID (UUID) |
| data.user.phone | string | 手机号 |
| data.user.role | string | 角色 (mobile) |
| data.user.profile.nickname | string | 昵称 |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 成功 |
| 3003 | 验证码错误或已过期 |
| 3004 | 未同意用户协议 |
| 3005 | 手机号已注册 |
| 3006 | 密码格式不正确 |
| 500 | 服务器内部错误 |

---

### 2.3 用户登录

**接口地址:** `POST /login`

**描述:** 使用手机号和密码进行登录。

**后端处理逻辑:**
1. **身份验证**: 根据手机号查询数据库，验证用户是否存在。
2. **密码比对**: 将请求中的明文密码与数据库中存储的哈希密码进行比对。
3. **生成 Token**: 验证通过后，根据用户信息及可选的 `token_expires_in` 参数生成 **JWT Token**。
4. **更新状态**: 更新数据库中用户的最后登录时间等元数据。

**请求头:**
```yaml
Content-Type: application/json
```

**请求参数:** 无

**请求体:**
```json
{
  "phone": "13800138000",
  "password": "abc123456",
  "token_expires_in": 7200
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| phone | string | 是 | 手机号 | "13800138000" |
| password | string | 是 | 登录密码 | "abc123456" |
| token_expires_in | number | 否 | Token 有效期（秒） | 7200 |

**请求示例:**
```bash
curl -X POST http://localhost:{PORT}/api/mobile/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "password": "abc123456"}'
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "phone": "13800138000",
      "role": "mobile"
    }
  }
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码 |
| msg | string | 提示信息 |
| data.token | string | 身份认证 Token (JWT) |
| data.user.id | string | 用户 ID |
| data.user.phone | string | 手机号 |
| data.user.role | string | 角色 |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 成功 |
| 3007 | 手机号不存在 |
| 3008 | 密码错误 |
| 500 | 服务器内部错误 |

---

### 2.4 重置密码

**接口地址:** `PUT /reset-password`

**描述:** 通过手机验证码重置登录密码。

**后端处理逻辑:**
1. **输入校验**: 验证手机号格式、验证码位数、新密码复杂度。
2. **验证码校验**: 从数据库中核对该手机号的 `reset` 类型验证码是否匹配且有效。
3. **用户核查**: 确认该手机号对应的账号确实存在。
4. **更新密码**: 将新密码进行哈希处理后，更新至数据库对应用户的 `password` 字段。
5. **清理**: 成功重置后，使该验证码失效。

**请求头:**
```yaml
Content-Type: application/json
```

**请求参数:** 无

**请求体:**
```json
{
  "phone": "13800138000",
  "code": "123456",
  "password": "newpwd123"
}
```

**字段说明:**
| 字段名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| phone | string | 是 | 手机号 | "13800138000" |
| code | string | 是 | 6位短信验证码 | "123456" |
| password | string | 是 | 新密码，6-16位，须包含字母和数字 | "newpwd123" |

**请求示例:**
```bash
curl -X PUT http://localhost:{PORT}/api/mobile/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "code": "123456", "password": "newpwd123"}'
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "密码重置成功",
  "data": null
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码 |
| msg | string | 提示信息 |
| data | object | 成功时为 null |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 成功 |
| 3003 | 验证码错误或已过期 |
| 3006 | 密码格式不正确 |
| 3007 | 手机号不存在 |
| 500 | 服务器内部错误 |
