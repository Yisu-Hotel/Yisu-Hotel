# Yisu Hotel PC端 用户模块接口文档

本文档详细描述了用户个人中心相关的 API 接口，包括个人资料管理和消息列表。

## 目录

1. [获取个人资料](#1-获取个人资料)
2. [更新个人资料](#2-更新个人资料)
3. [获取消息列表](#3-获取消息列表)

---

## 通用说明

*   **鉴权**: 所有接口均需要 `Authorization` Header，值为 `Bearer <token>`。
*   **Token**: 登录成功后通过登录接口获取。

---

## 1. 获取个人资料

获取当前登录用户的详细个人资料。

*   **接口路径**: `/pc/user/profile`
*   **请求方法**: `GET`
*   **鉴权**: 需要

### 请求参数

无

### 响应数据

| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data.id | string | 用户ID |
| data.phone | string | 手机号 |
| data.nickname | string | 昵称 |
| data.gender | string | 性别 |
| data.birthday | string | 生日 |
| data.avatar | string | 头像URL |

#### 成功示例
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "id": "uuid...",
    "phone": "13800138000",
    "nickname": "MyNickname",
    "gender": "男",
    "birthday": "1990-01-01",
    "avatar": "http://example.com/avatar.jpg"
  }
}
```

---

## 2. 更新个人资料

更新当前登录用户的个人资料。

*   **接口路径**: `/pc/user/profile`
*   **请求方法**: `PUT`
*   **鉴权**: 需要

### 请求参数 (Body)

| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| nickname | string | 否 | 昵称，2-50字符 | "NewNick" |
| gender | string | 否 | 性别: '男', '女', '保密' | "男" |
| birthday | string | 否 | 生日，格式 YYYY-MM-DD | "1990-01-01" |
| avatar | string | 否 | 头像URL，最大500字符 | "http://..." |
| avatar_base64 | string | 否 | 头像Base64字符串，最大2MB | "data:image..." |

### 响应数据

| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data | object | 更新后的用户资料 |

#### 成功示例
```json
{
  "code": 0,
  "msg": "更新成功",
  "data": {
    "nickname": "NewNick",
    "gender": "男",
    "birthday": "1990-01-01",
    "avatar": "http://..."
  }
}
```

#### 错误示例
```json
{
  "code": 4017,
  "msg": "昵称格式不正确",
  "data": null
}
```

---

## 3. 获取消息列表

分页获取用户的系统消息。

*   **接口路径**: `/pc/user/messages`
*   **请求方法**: `GET`
*   **鉴权**: 需要

### 请求参数 (Query)

| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| page | number | 否 | 页码，默认为 1 | 1 |

### 响应数据

| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data.list | array | 消息列表 |
| data.total | number | 总消息数 |
| data.page | number | 当前页码 |
| data.pageSize | number | 每页数量 (默认 5) |

#### 成功示例
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "total": 10,
    "page": 1,
    "pageSize": 5,
    "list": [
      {
        "id": "uuid...",
        "sender": "System",
        "status": "未读",
        "content": { "title": "Welcome", "body": "..." },
        "created_at": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

## 错误码说明

| 错误码 | 说明 |
| :--- | :--- |
| 0 | 成功 |
| 4008 | Token 无效或已过期 |
| 4009 | 参数格式不正确 |
| 4017 | 资料格式不正确（如昵称过长、生日格式错误等） |
| 500 | 服务器内部错误 |
