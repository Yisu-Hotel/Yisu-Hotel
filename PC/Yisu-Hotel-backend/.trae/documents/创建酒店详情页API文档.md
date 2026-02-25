# 酒店详情页API文档创建计划

## 文档结构

### 1. 基础信息
- 基础URL和认证方式
- 字符集和时区设置

### 2. 酒店信息管理
- **2.1 获取酒店详情**
  - 接口地址: `GET /mobile/hotels/{hotel_id}/detail`
  - 描述: 获取酒店详细信息（包含基础信息、设施、服务等）
  - 请求参数: hotel_id, check_in, check_out
  - 响应: 酒店完整信息，包括星级、评分、地址、距离、设施等

- **2.2 获取酒店图片列表**
  - 接口地址: `GET /mobile/hotels/{hotel_id}/images`
  - 描述: 获取酒店图片列表（外观、大堂、房间等）
  - 请求参数: hotel_id, type (可选)
  - 响应: 图片URL列表，包含图片类型和顺序

### 3. 日历和价格管理
- **3.1 获取可用日期和价格**
  - 接口地址: `GET /mobile/hotels/{hotel_id}/availability`
  - 描述: 获取指定日期范围内的可用状态和价格
  - 请求参数: hotel_id, start_date, end_date
  - 响应: 日期价格日历，包含是否可用和价格信息

- **3.2 计算价格**
  - 接口地址: `POST /mobile/hotels/{hotel_id}/calculate-price`
  - 描述: 计算指定入住离店日期的价格
  - 请求体: check_in, check_out, room_type_id, guests
  - 响应: 详细价格明细，包含房费、服务费、优惠等

### 4. 房型管理
- **4.1 获取房型列表**
  - 接口地址: `GET /mobile/hotels/{hotel_id}/room-types`
  - 描述: 获取酒店房型列表（按价格排序）
  - 请求参数: hotel_id, check_in, check_out
  - 响应: 房型列表，包含名称、床型、面积、价格、库存等

- **4.2 获取房型详情**
  - 接口地址: `GET /mobile/hotels/{hotel_id}/room-types/{room_type_id}`
  - 描述: 获取房型详细信息
  - 请求参数: hotel_id, room_type_id, check_in, check_out
  - 响应: 房型完整信息，包含最多入住人数、取消政策、额外服务等

### 5. 预订管理
- **5.1 创建预订**
  - 接口地址: `POST /mobile/hotels/{hotel_id}/bookings`
  - 描述: 创建酒店预订
  - 请求体: check_in, check_out, room_type_id, guests, contact_info
  - 响应: 预订确认信息，包含订单号、总价、预订状态等

- **5.2 检查预订可用性**
  - 接口地址: `POST /mobile/hotels/{hotel_id}/check-availability`
  - 描述: 检查预订可用性（防止超售）
  - 请求体: check_in, check_out, room_type_id, guests
  - 响应: 可用性状态，包含是否可订、剩余库存等

### 6. 收藏和分享
- **6.1 收藏/取消收藏酒店**
  - 接口地址: `POST /mobile/hotels/{hotel_id}/favorite`
  - 描述: 收藏或取消收藏酒店
  - 请求参数: hotel_id
  - 响应: 收藏状态，包含是否收藏、收藏数等

- **6.2 获取分享信息**
  - 接口地址: `GET /mobile/hotels/{hotel_id}/share`
  - 描述: 获取酒店分享信息（包含分享文本、图片、QR码等）
  - 请求参数: hotel_id
  - 响应: 分享数据，包含分享文本、图片URL、QR码URL等

### 7. 错误码定义
- 通用错误码（401未授权等）
- 业务错误码（酒店不存在、日期无效等）

## 技术实现要点

1. **保持一致性**: 遵循现有API文档的格式和结构
2. **完整性**: 覆盖酒店详情页所有功能需求
3. **实用性**: 提供详细的请求/响应示例和字段说明
4. **可扩展性**: 考虑未来功能扩展的可能性
5. **错误处理**: 提供全面的错误码和错误信息

## 文档位置
- 文件路径: `d:\github\Yisu-Hotel-backend\docs\M-api-document4.md`