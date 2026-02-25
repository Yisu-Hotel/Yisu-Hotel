# PC端认证模块开发日志

## 开发概述
完成PC端认证模块（Auth）的开发，包括用户注册、登录、忘记密码、重置密码等功能。

## 已实现接口

### 1. 检查账号
- 接口：`POST /auth/check-account`
- 功能：检查手机号是否已注册

### 2. 发送验证码
- 接口：`POST /auth/send-code`
- 功能：发送验证码到手机（支持注册、登录、重置密码类型）

### 3. 用户注册
- 接口：`POST /auth/register`
- 功能：通过手机号和验证码注册新用户
- 返回JWT token（有效期2小时）

### 4. 用户登录
- 接口：`POST /auth/login`
- 功能：手机号密码登录
- 返回JWT token（有效期2小时）
- 更新用户登录时间和登录次数

### 5. 忘记密码
- 接口：`POST /auth/forgot-password`
- 功能：发送重置密码验证码

### 6. 重置密码
- 接口：`POST /auth/reset-password`
- 功能：通过验证码重置用户密码

## 核心功能实现

### 短信服务（SMS）
- 文件：`src/utils/sms.js`
- 集成阿里云短信服务
- 支持发送验证码短信
- 配置：`.env` 文件中的阿里云AccessKey配置

### JWT认证
- 使用 `jsonwebtoken` 库生成和验证token
- Token包含：userId、phone、role
- 有效期：2小时
- 密钥存储：`.env` 文件中的 `JWT_SECRET`

### 密码加密
- 使用 `bcryptjs` 进行密码哈希
- 加密强度：10轮

## 目录结构

```
src/
├── controllers/pc/
│   └── auth.js          # 认证控制器
├── middlewares/pc/
│   └── auth.js          # 请求验证中间件
├── routes/pc/
│   └── auth.js          # 路由配置
├── tests/pc/
│   ├── auth.test.js
│   ├── send-code.test.js
│   ├── register.test.js
│   ├── login.test.js
│   ├── forgot-password.test.js
│   ├── reset-password.test.js
│   └── jwt.test.js
└── utils/
    ├── code.js          # 验证码生成
    └── sms.js           # 短信服务
```

## 测试
所有接口均有对应的测试文件，位于 `src/tests/pc/` 目录。
