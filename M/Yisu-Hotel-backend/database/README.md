# 数据库脚本使用说明

本目录用于数据库初始化、重置与种子数据填充。

## 必要前提

请在项目根目录配置 `.env`，并确保包含 `DATABASE_URL`。

示例：
```
DATABASE_URL=postgresql://postgres:123456@localhost:5432/yisu
```

## 一键初始化数据库

初始化表结构、执行必要迁移、填充种子数据：
```
npm run db:init
```
或
```
node database/init-all.js
```

## 一键重置数据库

删除并重建表结构、执行必要迁移、填充种子数据：
```
npm run db:reset
```
或
```
node database/reset-all.js
```

## 单独脚本

```
node database/init-db.js
node database/reset-database.js
node database/seed-database.js
node database/migrate-hotel-image-base64.js
node database/migrate-avatar-base64.js
```
