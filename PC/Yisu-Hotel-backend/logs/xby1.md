# 易宿酒店后端开发日志

## 文件说明

### 数据库文件

#### `database/init-db.js`
数据库初始化脚本，执行 `init.sql` 创建表结构。

```bash
node database/init-db.js
```

#### `database/init.sql`
数据库表结构定义，包含 25 个表及索引。

#### `database/reset-database.js`
数据库重置脚本，删除并重建所有表。

```bash
node database/reset-database.js
```

#### `database/seed-database.js`
种子数据脚本，插入测试数据。

```bash
node database/seed-database.js
```

### 源代码目录

#### `src/config/database.js`
Sequelize 数据库配置，连接 PostgreSQL。

#### `src/controllers/`
控制器目录，处理 HTTP 请求。
- `pc/auth.js` - 认证控制器

#### `src/middlewares/`
中间件目录，请求预处理和验证。
- `pc/auth.js` - 认证中间件

#### `src/models/`
数据模型目录，定义表结构和关系。
- `entities/` - 所有实体模型

#### `src/routes/`
路由目录，定义 API 路由。
- `pc/auth.js` - 认证路由

#### `src/tests/`
测试文件目录。
- `pc/auth.test.js` - 认证接口测试

#### `src/utils/`
工具函数目录。
- `validator.js` - 验证工具

### 配置文件

#### `.env`
环境变量配置。
```env
PORT=5050
DATABASE_URL=postgresql://postgres:123456@localhost:5432/yisu
```

## 开发流程

```bash
# 1. 安装依赖
npm install

# 2. 初始化数据库(可选)
node database/reset-database.js

# 3. 填充测试数据
node database/seed-database.js

# 4. 启动服务器
node app.js

# 5. 运行测试
node src/tests/pc/auth.test.js
```

## 开发日志

### 2026-02-07

- 完成数据库表结构设计
- 创建所有 Sequelize 模型
- 实现数据库初始化、重置、种子数据脚本
- 创建 PC 端认证接口
- 编写接口测试用例
