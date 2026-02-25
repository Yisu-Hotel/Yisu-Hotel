# Yisu Hotel PC端 酒店模块接口文档

本文档详细描述了酒店管理相关的 API 接口，包括酒店的创建、更新、查询、详情、删除及审核状态查询。

## 目录

1. [创建酒店](#1-创建酒店)
2. [更新酒店](#2-更新酒店)
3. [获取酒店列表](#3-获取酒店列表)
4. [获取酒店详情](#4-获取酒店详情)
5. [获取审核状态](#5-获取审核状态)
6. [删除酒店](#6-删除酒店)

---

## 通用说明

*   **鉴权**: 所有接口均需要 `Authorization` Header，值为 `Bearer <token>`。

---

## 1. 创建酒店

创建新的酒店信息（支持保存为草稿或直接提交审核）。

*   **接口路径**: `/pc/hotel/create`
*   **请求方法**: `POST`
*   **鉴权**: 需要

### 请求参数 (Body)

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| save_as_draft | boolean | 否 | 是否保存为草稿。true: 仅保存不校验必填项; false(默认): 提交审核，严格校验。 |
| hotel_name_cn | string | 是 | 酒店中文名 |
| hotel_name_en | string | 是 | 酒店英文名 |
| star_rating | number | 是 | 星级 (1-5) |
| description | string | 是 | 酒店描述 |
| phone | string | 是 | 联系电话 |
| opening_date | string | 是 | 开业日期 (YYYY-MM-DD) |
| nearby_info | string | 否 | 周边信息 |
| main_image_url | string[] | 否 | 主图 URL 列表 |
| main_image_base64 | string[] | 否 | 主图 Base64 列表 |
| tags | string[] | 否 | 标签列表 |
| location_info | object | 是 | 位置信息 |
| facilities | object[] | 否 | 设施列表 |
| services | object[] | 否 | 服务列表 |
| policies | object | 否 | 酒店政策 |
| room_prices | object | 是 | 房型及价格信息 |

#### location_info 结构
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| formatted_address | string | 完整地址 |
| country | string | 国家 |
| province | string | 省份 |
| city | string | 城市 |
| district | string | 区县 |
| street | string | 街道 |
| number | string | 门牌号 |
| location | string | 经纬度坐标 (例如 "121.4737,31.2304") |

#### room_prices 结构
Key 为房型名称（如 "豪华大床房"），Value 为房型详情对象：
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| bed_type | string | 床型: 'king', 'twin', 'queen' |
| area | number | 面积 (平米) |
| description | string | 房型描述 |
| room_image_url | string | 图片URL |
| facilities | object[] | 房型设施 [{id, name}] |
| services | object[] | 房型服务 [{id, name}] |
| tags | string[] | 房型标签 |
| policies | object | 房型政策 {cancellation, payment...} |
| prices | object | 每日价格，Key为日期(YYYY-MM-DD)，Value为价格(number) |

### 请求示例
```json
{
  "save_as_draft": false,
  "hotel_name_cn": "和平饭店",
  "hotel_name_en": "Peace Hotel",
  "star_rating": 5,
  "description": "历史悠久的豪华酒店...",
  "phone": "021-63216888",
  "opening_date": "1929-08-01",
  "location_info": {
    "formatted_address": "上海市黄浦区南京东路20号",
    "country": "中国",
    "province": "上海市",
    "city": "上海市",
    "district": "黄浦区",
    "location": "121.49,31.24"
  },
  "facilities": [{"id": "wifi", "name": "无线网络"}],
  "policies": {
    "cancellation": "入住前24小时免费取消",
    "payment": "在线支付",
    "children": "允许携带儿童",
    "pets": "不可携带宠物"
  },
  "room_prices": {
    "豪华江景房": {
      "bed_type": "king",
      "area": 45,
      "description": "可以看到外滩全景",
      "prices": {
        "2023-10-01": 2000,
        "2023-10-02": 2200
      }
    }
  }
}
```

### 响应数据

| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 0: 成功 |
| msg | string | "草稿已保存" 或 "酒店信息创建成功，等待审核" |
| data | object | 创建后的酒店数据 |

---

## 2. 更新酒店

更新已有的酒店信息。

*   **接口路径**: `/pc/hotel/update/:id`
*   **请求方法**: `PUT`
*   **鉴权**: 需要

### 请求参数
*   **Path 参数**: `id` (酒店ID)
*   **Body 参数**: 同 [创建酒店](#1-创建酒店)，`save_as_draft` 为 true 时可部分更新。

### 响应数据
同创建酒店。

---

## 3. 获取酒店列表

分页查询当前用户创建的酒店列表。

*   **接口路径**: `/pc/hotel/list`
*   **请求方法**: `GET`
*   **鉴权**: 需要

### 请求参数 (Query)

| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| page | number | 否 | 页码 (默认1) |
| size | number | 否 | 每页数量 (默认20, 最大100) |
| status | string | 否 | 状态筛选: 'draft', 'pending', 'approved', 'rejected' |
| keyword | string | 否 | 搜索关键字 (酒店名) |

### 响应数据

| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 0 |
| data.total | number | 总数 |
| data.list | array | 酒店列表 |

---

## 4. 获取酒店详情

获取单个酒店的详细信息。

*   **接口路径**: `/pc/hotel/detail/:id`
*   **请求方法**: `GET`
*   **鉴权**: 需要

### 请求参数 (Path)
| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | string | 酒店ID |

### 响应数据
返回酒店的完整信息，结构与创建时的请求体类似，但包含 ID 等系统字段。

---

## 5. 获取审核状态

查询酒店的审核历史日志。

*   **接口路径**: `/pc/hotel/audit-status/:id`
*   **请求方法**: `GET`
*   **鉴权**: 需要

### 请求参数 (Path)
| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | string | 酒店ID |

### 响应数据
| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| data | array | 审核日志列表 [{audited_at, result, reject_reason, auditor_name}] |

---

## 6. 删除酒店

删除酒店（通常仅限草稿或未发布的酒店）。

*   **接口路径**: `/pc/hotel/delete/:id`
*   **请求方法**: `DELETE`
*   **鉴权**: 需要

### 请求参数 (Path)
| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | string | 酒店ID |

### 响应数据
| 参数名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 0 表示成功 |

## 错误码说明

| 错误码 | 说明 |
| :--- | :--- |
| 4001 | 必填项不能为空 |
| 4003 | 酒店星级格式不正确 |
| 4004 | 房型格式不正确 |
| 4005 | 价格格式不正确 |
| 4006 | 开业时间格式不正确 |
| 4007 | 地址格式不正确 |
| 4009 | 参数格式不正确 (如ID非UUID) |
