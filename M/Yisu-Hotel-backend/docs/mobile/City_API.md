# Yisu Hotel 移动端 城市模块接口文档

本文档描述了获取酒店业务涉及的城市列表及城市搜索相关的 API 接口。

---

## 1. 基础信息

- **基础URL**: `http://localhost:{PORT}/api/mobile/city`
- **数据格式**: `application/json`
- **鉴权**: 公开接口，无需 `Authorization` Header。

---

## 2. API 端点

### 2.1 获取所有城市列表

**接口地址:** `GET /list`

**描述:** 获取数据库中存储的所有城市信息，用于前端城市选择器展示。参考数据库：[Database_Schema.md: L209-222](file:///d:/Yisu/Yisu-Hotel-backend/docs/Database_Schema.md#L209-222)。

**后端自动处理逻辑说明:**
1. **全量查询**: 后端从 `cities` 表中检索所有处于启用状态的城市记录。
2. **排序逻辑**: 默认按照 `sort` 字段进行升序排列（数值越小越靠前），确保如“热门城市”或“省会城市”能根据预设权重优先展示。
3. **数据格式化**: 将经纬度等数值类型进行规范化处理，并返回给前端用于地图定位或筛选。

**请求参数:** 无

**请求示例:**
```bash
curl -X GET http://localhost:{PORT}/api/mobile/city/list
```

**响应示例:**
```json
{
  "code": 0,
  "msg": "查询成功",
  "data": [
    {
      "id": "city-001",
      "city_name": "北京市",
      "province": "北京",
      "latitude": 39.9042,
      "longitude": 116.4074,
      "sort": 1
    },
    {
      "id": "city-002",
      "city_name": "上海市",
      "province": "上海",
      "latitude": 31.2304,
      "longitude": 121.4737,
      "sort": 2
    }
  ]
}
```

**响应字段说明:**
| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| code | number | 状态码，0 表示成功 |
| msg | string | 提示信息 |
| data | array | 城市对象列表 |
| data[].id | string | 城市 ID |
| data[].city_name | string | 城市名称 |
| data[].province | string | 所属省份 |
| data[].latitude | number | 纬度 |
| data[].longitude | number | 经度 |
| data[].sort | number | 排序权重（数值越小越靠前） |

**错误码:**
| 错误码 | 说明 |
| :--- | :--- |
| 0 | 请求成功 |
| 500 | 服务器内部错误 |
