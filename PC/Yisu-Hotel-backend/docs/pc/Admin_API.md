# Yisu Hotel PC端 后台管理接口文档

本文档详细描述了管理员用于审核和管理酒店的 API 接口。

## 目录

1. [获取酒店审核列表](#1-获取酒店审核列表)
2. [获取管理员视角酒店详情](#2-获取管理员视角酒店详情)
3. [批量审核酒店](#3-批量审核酒店)

---

## 通用说明

*   **鉴权**: 所有接口均需要 `Authorization` Header，值为 `Bearer <token>`。
*   **权限**: 仅限 `role` 为 `admin` 的用户访问。若权限不足，返回 `4019`。

---

## 1. 获取酒店审核列表

分页查询酒店审核列表，支持多种条件筛选。

*   **接口路径**: `/pc/admin/hotel/audit-list`
*   **请求方法**: `GET`
*   **鉴权**: 需要 (Admin)

### 请求参数 (Query)

| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| page | number | 否 | 页码，默认 1 | 1 |
| page_size | number | 否 | 每页数量，默认 10，最大 100 | 20 |
| status | string | 否 | 状态: 'pending', 'auditing', 'approved', 'rejected' | "pending" |
| start_date | string | 否 | 开始日期 (YYYY-MM-DD) | "2023-01-01" |
| end_date | string | 否 | 结束日期 (YYYY-MM-DD) | "2023-01-31" |
| keyword | string | 否 | 搜索关键字 (酒店名) | "和平饭店" |

### 响应数据

| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 0 |
| data.total | number | 总数 |
| data.list | array | 酒店列表 |

---

## 2. 获取管理员视角酒店详情

获取酒店的完整详情，用于审核查看。

*   **接口路径**: `/pc/admin/hotel/detail/:id`
*   **请求方法**: `GET`
*   **鉴权**: 需要 (Admin)

### 请求参数 (Path)
| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | string | 酒店ID |

### 响应数据
同酒店详情接口。

---

## 3. 批量审核酒店

对多个酒店进行批量审核操作（通过或拒绝）。

*   **接口路径**: `/pc/admin/hotel/batch-audit`
*   **请求方法**: `POST`
*   **鉴权**: 需要 (Admin)

### 请求参数 (Body)

| 参数名 | 类型 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- | :--- |
| hotel_ids | string[] | 是 | 酒店ID数组 | ["uuid1", "uuid2"] |
| status | string | 是 | 审核结果: 'approved' (通过), 'rejected' (拒绝) | "rejected" |
| reject_reason | string | 条件必填 | 当 status 为 rejected 时必填 | "图片模糊，请重新上传" |

### 响应数据

| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 0 |
| msg | string | "审核成功" |
| data | object | 操作结果详情 |

## 错误码说明

| 错误码 | 说明 |
| :--- | :--- |
| 4019 | 无权限访问此接口 |
| 4009 | 参数格式不正确 |
