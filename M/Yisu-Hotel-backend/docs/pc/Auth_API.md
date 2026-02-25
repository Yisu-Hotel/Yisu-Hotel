# Yisu Hotel PC端 认证模块接口文档

本文档详细描述了用户认证相关的 API 接口，包括注册、登录、密码重置等功能。

## 目录

1. [检查账号状态](#1-检查账号状态)
2. [发送验证码](#2-发送验证码)
3. [用户注册](#3-用户注册)
4. [用户登录](#4-用户登录)
5. [忘记密码](#5-忘记密码)
6. [重置密码](#6-重置密码)

---

## 1. 检查账号状态

检查手机号是否已被注册。

*   **接口路径**: `/pc/auth/check-account`
*   **请求方法**: `POST`
*   **鉴权**: 无需鉴权

### 请求参数 (Body)

| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| phone | string | 是 | 手机号，需满足 1[3-9]\d{9} 格式 | "13800138000" |

### 响应数据

| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data.available | boolean | true 表示账号可用（未注册），false 表示已被注册 |

#### 成功示例
```json
{
  "code": 0,
  "msg": "账号可用",
  "data": {
    "available": true
  }
}
```

#### 错误示例
```json
{
  "code": 3001,
  "msg": "手机号格式不正确",
  "data": null
}
```

---

## 2. 发送验证码

向指定手机号发送短信验证码。

*   **接口路径**: `/pc/auth/send-code`
*   **请求方法**: `POST`
*   **鉴权**: 无需鉴权

### 请求参数 (Body)

| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| phone | string | 是 | 手机号 | "13800138000" |
| type | string | 是 | 验证码类型: 'register', 'login', 'reset' | "register" |

### 响应数据

| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data | object | 发送结果详情 |

#### 成功示例
```json
{
  "code": 0,
  "msg": "验证码已发送",
  "data": {
    "requestId": "..."
  }
}
```

---

## 3. 用户注册

新用户注册账号。

*   **接口路径**: `/pc/auth/register`
*   **请求方法**: `POST`
*   **鉴权**: 无需鉴权

### 请求参数 (Body)

| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| phone | string | 是 | 手机号 | "13800138000" |
| password | string | 是 | 密码，长度 6-20 位 | "password123" |
| code | string | 是 | 6位数字验证码 | "123456" |
| role | string | 是 | 角色: 'merchant' (商家), 'admin' (管理员) | "merchant" |
| agreed | boolean | 是 | 必须为 true，表示同意协议 | true |

### 响应数据

| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data | object | 注册成功的用户数据 |

#### 成功示例
```json
{
  "code": 0,
  "msg": "注册成功",
  "data": {
    "id": "uuid...",
    "phone": "13800138000",
    "role": "merchant"
  }
}
```

---

## 4. 用户登录

用户使用手机号和密码登录。

*   **接口路径**: `/pc/auth/login`
*   **请求方法**: `POST`
*   **鉴权**: 无需鉴权

### 请求参数 (Body)

| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| phone | string | 是 | 手机号 | "13800138000" |
| password | string | 是 | 密码 | "password123" |
| token_expires_in | string | 否 | Token 过期时间，如 '7d', '24h' | "7d" |

### 响应数据

| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data.token | string | JWT Token，后续请求需放入 Header: Authorization |
| data.user | object | 用户基本信息 |

#### 成功示例
```json
{
  "code": 0,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "uuid...",
      "phone": "13800138000",
      "role": "merchant",
      "nickname": "MyNickname"
    }
  }
}
```

---

## 5. 忘记密码

请求重置密码的验证码。

*   **接口路径**: `/pc/auth/forgot-password`
*   **请求方法**: `POST`
*   **鉴权**: 无需鉴权

### 请求参数 (Body)

| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| phone | string | 是 | 手机号 | "13800138000" |

### 响应数据

| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data | null | 无数据 |

#### 成功示例
```json
{
  "code": 0,
  "msg": "验证码已发送",
  "data": null
}
```

---

## 6. 重置密码

使用验证码重置密码。

*   **接口路径**: `/pc/auth/reset-password`
*   **请求方法**: `POST`
*   **鉴权**: 无需鉴权

### 请求参数 (Body)

| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| phone | string | 是 | 手机号 | "13800138000" |
| code | string | 是 | 6位数字验证码 | "123456" |
| new_password | string | 是 | 新密码，长度 6-20 位 | "newpass123" |

### 响应数据

| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data | null | 无数据 |

#### 成功示例
```json
{
  "code": 0,
  "msg": "密码重置成功",
  "data": null
}
```

## 错误码说明

| 错误码 | 说明 |
| :--- | :--- |
| 0 | 成功 |
| 3001 | 参数格式错误（手机号、验证码、类型等） |
| 3006 | 密码格式不正确 |
| 400 | 请求参数错误 |
| 500 | 服务器内部错误 |
