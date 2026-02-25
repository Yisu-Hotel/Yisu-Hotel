# 今日工作总结

## 日期
2026-02-08

## 未完成事项

### 1. 下线按钮功能
- 能将对应酒店的状态从目前状态直接改为 rejected 态
- 同时对用户发送下线信息

### 2. 上线按钮功能
- 能将对应的酒店状态从目前状态直接改为 approved 态

### 3. 数据库新表
- 添加新表，用于储存每个用户的消息信息

### 4. 查看详情功能
- 当用户点击查看详情或者审核时会展示出酒店的详情

## 目前修改

### 1. 商户端接口和页面
- 完成了商户端所有接口的构建
- 完成了商户端页面的搭建

### 2. 管理员端
- 完成了管理员端前端页面的搭建
- 完成了审核酒店信息的获取接口

### 3. 用户注册功能
- 实现了用户注册时自动生成随机昵称
- 昵称格式：角色名 + 4位随机数字（如 merchant5001）
- 昵称同时存储在 users 表和 user_profiles 表中

### 4. 获取用户资料接口
- 实现了 GET /user/profile 接口
- 通过 JWT Token 验证用户身份
- 返回用户基本信息（ID、账号、角色、昵称、创建时间、更新时间）

### 5. JWT 认证中间件
- 创建了 authenticateToken 中间件
- 用于验证请求头中的 Bearer Token
- Token 无效或过期时返回错误码 4008

### 6. 工具函数优化
- 将 validator.js 中的所有函数提取出来
- 统一函数形式，提高代码可读性

### 7. 接口测试
- 完成了获取用户资料接口的测试
- 修改测试文件支持从终端手动输入 Token
- 优化了审核状态测试，使用固定的测试 ID

### 8. API 文档更新
- 更新了酒店列表接口文档
- 添加了收藏量、评分、预定量、评论量字段

## 文件变更清单

### 新增文件
- src/middlewares/pc/user.js - JWT 认证中间件
- src/controllers/pc/user.js - 用户控制器
- src/routes/pc/user.js - 用户路由
- src/utils/nickname.js - 昵称生成工具函数

### 修改文件
- src/controllers/pc/auth.js - 注册时生成昵称
- src/utils/code.js - 添加昵称生成函数（后移至 nickname.js）
- src/utils/validator.js - 统一函数形式
- src/tests/pc/get-profile.test.js - 支持手动输入 Token
- src/tests/pc/audit-status.test.js - 使用固定测试 ID
- docs/PC-api-document2.md - 更新酒店列表接口文档
- app.js - 注册用户路由

### 删除文件
- src/middlewares/auth.js - 移至 middlewares/pc/user.js

启动：
node --max-old-space-size=12288 app.js