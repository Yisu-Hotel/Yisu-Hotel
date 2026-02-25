# Yisu Hotel PC端 后端文档

本目录包含了 Yisu Hotel PC 端后端的详细开发文档。

## 文档列表

### 1. 数据库文档
*   [数据库架构说明 (Database_Schema.md)](./Database_Schema.md)
    *   包含所有数据表的结构、字段定义及关联关系。

### 2. API 接口文档
*   [认证模块 (Auth_API.md)](./Auth_API.md)
    *   注册、登录、验证码、密码重置。
*   [用户模块 (User_API.md)](./User_API.md)
    *   个人资料管理、系统消息。
*   [酒店模块 (Hotel_API.md)](./Hotel_API.md)
    *   酒店创建、更新、查询、详情、删除。
*   [管理模块 (Admin_API.md)](./Admin_API.md)
    *   管理员审核列表、批量审核。

## 快速开始

所有 API 接口的基础 URL 请参考环境配置文件。
大部分接口需要 `Authorization` Header 进行身份验证。
