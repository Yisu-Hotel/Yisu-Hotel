# Yisu Hotel PC端 数据库架构文档

本文档详细描述了 Yisu Hotel 系统 PC 端的数据库表结构设计。

## 目录

1. [用户相关](#1-用户相关)
    - [User (用户表)](#11-user-用户表)
    - [UserProfile (用户资料表)](#12-userprofile-用户资料表)
    - [UserThirdPartyAuth (第三方认证表)](#13-userthirdpartyauth-第三方认证表)
    - [VerificationCode (验证码表)](#14-verificationcode-验证码表)
    - [Favorite (收藏表)](#15-favorite-收藏表)
2. [酒店相关](#2-酒店相关)
    - [Hotel (酒店表)](#21-hotel-酒店表)
    - [HotelHistory (酒店变更历史表)](#22-hotelhistory-酒店变更历史表)
    - [HotelPolicy (酒店政策表)](#23-hotelpolicy-酒店政策表)
    - [HotelFacility (酒店设施关联表)](#24-hotelfacility-酒店设施关联表)
    - [HotelService (酒店服务关联表)](#25-hotelservice-酒店服务关联表)
    - [HotelReview (酒店评价表)](#26-hotelreview-酒店评价表)
    - [City (城市表)](#27-city-城市表)
    - [AuditLog (审核日志表)](#28-auditlog-审核日志表)
3. [房型相关](#3-房型相关)
    - [RoomType (房型表)](#31-roomtype-房型表)
    - [RoomPrice (房型价格表)](#32-roomprice-房型价格表)
    - [RoomPolicy (房型政策表)](#33-roompolicy-房型政策表)
    - [RoomTag (房型标签表)](#34-roomtag-房型标签表)
    - [RoomFacility (房型设施关联表)](#35-roomfacility-房型设施关联表)
    - [RoomService (房型服务关联表)](#36-roomservice-房型服务关联表)
4. [基础数据](#4-基础数据)
    - [Facility (设施字典表)](#41-facility-设施字典表)
    - [Service (服务字典表)](#42-service-服务字典表)
5. [订单与营销](#5-订单与营销)
    - [Booking (订单表)](#51-booking-订单表)
    - [Coupon (优惠券表)](#52-coupon-优惠券表)
    - [UserCoupon (用户优惠券表)](#53-usercoupon-用户优惠券表)
    - [Banner (轮播图表)](#54-banner-轮播图表)
6. [其他](#6-其他)
    - [Message (消息表)](#61-message-消息表)

---

## 1. 用户相关

### 1.1 User (用户表)
*   **表名**: `users`
*   **描述**: 存储用户的核心账号信息。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| id | UUID | 是 | UUIDV4 | 主键 |
| phone | STRING(100) | 是 | - | 手机号，唯一索引 |
| password | STRING(255) | 否 | - | 密码 |
| role | STRING(20) | 是 | - | 角色: merchant, admin, mobile |
| nickname | STRING(50) | 否 | - | 昵称 |
| last_login_at | DATE | 否 | - | 最后登录时间 |
| login_count | INTEGER | 是 | 0 | 登录次数 |
| created_at | DATE | 是 | NOW | 创建时间 |
| updated_at | DATE | 是 | NOW | 更新时间 |

### 1.2 UserProfile (用户资料表)
*   **表名**: `user_profiles`
*   **描述**: 存储用户的详细个人资料。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| user_id | UUID | 是 | - | 主键，外键 -> users.id |
| nickname | STRING(50) | 否 | - | 昵称 |
| gender | STRING(10) | 否 | - | 性别: 男, 女, 保密 |
| birthday | DATEONLY | 否 | - | 生日 |
| avatar | STRING(500) | 否 | - | 头像URL |
| avatar_base64 | TEXT | 否 | - | 头像Base64 |
| created_at | DATE | 是 | NOW | 创建时间 |
| updated_at | DATE | 是 | NOW | 更新时间 |

### 1.3 UserThirdPartyAuth (第三方认证表)
*   **表名**: `user_third_party_auth`
*   **描述**: 存储第三方登录授权信息。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| id | UUID | 是 | UUIDV4 | 主键 |
| user_id | UUID | 是 | - | 外键 -> users.id |
| provider | STRING(20) | 是 | - | 提供商: wechat, alipay |
| open_id | STRING(100) | 是 | - | 第三方唯一ID |
| nickname | STRING(50) | 否 | - | 第三方昵称 |
| avatar | STRING(500) | 否 | - | 第三方头像 |
| created_at | DATE | 是 | NOW | 创建时间 |
| updated_at | DATE | 是 | NOW | 更新时间 |

### 1.4 VerificationCode (验证码表)
*   **表名**: `verification_codes`
*   **描述**: 存储短信验证码记录。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| id | UUID | 是 | UUIDV4 | 主键 |
| phone | STRING(100) | 是 | - | 手机号 |
| code | STRING(10) | 是 | - | 验证码 |
| type | STRING(20) | 是 | - | 类型: register, login, reset |
| expires_at | DATE | 是 | - | 过期时间 |
| used | BOOLEAN | 是 | false | 是否已使用 |
| created_at | DATE | 是 | NOW | 创建时间 |

### 1.5 Favorite (收藏表)
*   **表名**: `favorites`
*   **描述**: 存储用户收藏的酒店。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| id | UUID | 是 | UUIDV4 | 主键 |
| user_id | UUID | 是 | - | 外键 -> users.id |
| hotel_id | UUID | 是 | - | 外键 -> hotels.id |
| created_at | DATE | 是 | NOW | 创建时间 |

---

## 2. 酒店相关

### 2.1 Hotel (酒店表)
*   **表名**: `hotels`
*   **描述**: 存储酒店核心信息。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| id | UUID | 是 | UUIDV4 | 主键 |
| hotel_name_cn | STRING(100) | 是 | - | 中文名称 |
| hotel_name_en | STRING(100) | 是 | - | 英文名称 |
| star_rating | INTEGER | 是 | - | 星级 (1-5) |
| rating | DECIMAL(3, 2) | 否 | - | 评分 |
| review_count | INTEGER | 是 | 0 | 评价数量 |
| description | TEXT | 否 | - | 描述 |
| phone | STRING(20) | 否 | - | 联系电话 |
| opening_date | DATEONLY | 是 | - | 开业日期 |
| nearby_info | TEXT | 否 | - | 周边信息 |
| main_image_url | JSONB | 否 | - | 主图URL列表 |
| main_image_base64 | JSONB | 否 | - | 主图Base64列表 |
| tags | JSONB | 否 | - | 标签 |
| location_info | JSONB | 否 | - | 位置信息 |
| status | STRING(20) | 是 | - | 状态: draft, pending, auditing, approved, rejected, published, offline |
| created_by | UUID | 是 | - | 外键 -> users.id |
| created_at | DATE | 是 | NOW | 创建时间 |
| updated_at | DATE | 是 | NOW | 更新时间 |

### 2.2 HotelHistory (酒店变更历史表)
*   **表名**: `hotel_history`
*   **描述**: 记录酒店信息的变更历史。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| id | UUID | 是 | UUIDV4 | 主键 |
| hotel_id | UUID | 是 | - | 外键 -> hotels.id |
| version | INTEGER | 是 | - | 版本号 |
| modified_by | UUID | 是 | - | 外键 -> users.id |
| modified_at | DATE | 是 | NOW | 修改时间 |
| changes | JSONB | 是 | - | 变更内容 |

### 2.3 HotelPolicy (酒店政策表)
*   **表名**: `hotel_policies`
*   **描述**: 存储酒店的各类政策。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| hotel_id | UUID | 是 | - | 主键，外键 -> hotels.id |
| cancellation_policy | TEXT | 否 | - | 取消政策 |
| payment_policy | TEXT | 否 | - | 支付政策 |
| children_policy | TEXT | 否 | - | 儿童政策 |
| pets_policy | TEXT | 否 | - | 宠物政策 |
| created_at | DATE | 是 | NOW | 创建时间 |
| updated_at | DATE | 是 | NOW | 更新时间 |

### 2.4 HotelFacility (酒店设施关联表)
*   **表名**: `hotel_facilities`
*   **描述**: 酒店与设施的多对多关联。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| hotel_id | UUID | 是 | - | 联合主键，外键 -> hotels.id |
| facility_id | STRING(50) | 是 | - | 联合主键，外键 -> facilities.id |
| created_at | DATE | 是 | NOW | 创建时间 |

### 2.5 HotelService (酒店服务关联表)
*   **表名**: `hotel_services`
*   **描述**: 酒店与服务的多对多关联。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| hotel_id | UUID | 是 | - | 联合主键，外键 -> hotels.id |
| service_id | STRING(50) | 是 | - | 联合主键，外键 -> services.id |
| created_at | DATE | 是 | NOW | 创建时间 |

### 2.6 HotelReview (酒店评价表)
*   **表名**: `hotel_reviews`
*   **描述**: 存储用户对酒店的评价。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| id | UUID | 是 | UUIDV4 | 主键 |
| hotel_id | UUID | 是 | - | 外键 -> hotels.id |
| user_id | UUID | 是 | - | 外键 -> users.id |
| room_type_id | UUID | 否 | - | 外键 -> room_types.id |
| booking_id | UUID | 否 | - | 外键 -> bookings.id |
| rating | DECIMAL(3, 2) | 是 | - | 评分 (1-5) |
| content | TEXT | 否 | - | 评价内容 |
| images | JSONB | 否 | - | 图片列表 |
| is_anonymous | BOOLEAN | 是 | false | 是否匿名 |
| created_at | DATE | 是 | NOW | 创建时间 |
| updated_at | DATE | 是 | NOW | 更新时间 |

### 2.7 City (城市表)
*   **表名**: `cities`
*   **描述**: 存储城市基础数据。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| id | STRING(50) | 是 | - | 主键 |
| city_name | STRING(100) | 是 | - | 城市名称 |
| province | STRING(50) | 否 | - | 省份 |
| latitude | DECIMAL(10, 7) | 否 | - | 纬度 |
| longitude | DECIMAL(10, 7) | 否 | - | 经度 |
| sort | INTEGER | 是 | 0 | 排序 |
| created_at | DATE | 是 | NOW | 创建时间 |
| updated_at | DATE | 是 | NOW | 更新时间 |

### 2.8 AuditLog (审核日志表)
*   **表名**: `audit_logs`
*   **描述**: 记录酒店审核操作日志。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| id | UUID | 是 | UUIDV4 | 主键 |
| hotel_id | UUID | 是 | - | 外键 -> hotels.id |
| auditor_id | UUID | 是 | - | 外键 -> users.id |
| audited_at | DATE | 是 | NOW | 审核时间 |
| result | STRING(20) | 是 | - | 结果: approved, rejected |
| reject_reason | TEXT | 否 | - | 拒绝原因 |
| created_at | DATE | 是 | NOW | 创建时间 |

---

## 3. 房型相关

### 3.1 RoomType (房型表)
*   **表名**: `room_types`
*   **描述**: 存储酒店的房型信息。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| id | UUID | 是 | UUIDV4 | 主键 |
| hotel_id | UUID | 是 | - | 外键 -> hotels.id |
| room_type_name | STRING(50) | 是 | - | 房型名称 |
| bed_type | STRING(20) | 是 | - | 床型: king, twin, queen |
| area | INTEGER | 是 | - | 面积 |
| description | TEXT | 否 | - | 描述 |
| room_image_url | STRING(500) | 否 | - | 图片URL |
| room_image_base64 | TEXT | 否 | - | 图片Base64 |
| created_at | DATE | 是 | NOW | 创建时间 |
| updated_at | DATE | 是 | NOW | 更新时间 |

### 3.2 RoomPrice (房型价格表)
*   **表名**: `room_prices`
*   **描述**: 存储房型的每日价格。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| id | UUID | 是 | UUIDV4 | 主键 |
| room_type_id | UUID | 是 | - | 外键 -> room_types.id |
| price_date | DATEONLY | 是 | - | 日期 |
| price | DECIMAL(10, 2) | 是 | - | 价格 |
| created_at | DATE | 是 | NOW | 创建时间 |
| updated_at | DATE | 是 | NOW | 更新时间 |

### 3.3 RoomPolicy (房型政策表)
*   **表名**: `room_policies`
*   **描述**: 存储房型的特定政策。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| room_type_id | UUID | 是 | - | 主键，外键 -> room_types.id |
| cancellation_policy | TEXT | 否 | - | 取消政策 |
| payment_policy | TEXT | 否 | - | 支付政策 |
| children_policy | TEXT | 否 | - | 儿童政策 |
| pets_policy | TEXT | 否 | - | 宠物政策 |
| created_at | DATE | 是 | NOW | 创建时间 |
| updated_at | DATE | 是 | NOW | 更新时间 |

### 3.4 RoomTag (房型标签表)
*   **表名**: `room_tags`
*   **描述**: 存储房型的标签。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| id | UUID | 是 | UUIDV4 | 主键 |
| room_type_id | UUID | 是 | - | 外键 -> room_types.id |
| tag_name | STRING(50) | 是 | - | 标签名 |
| created_at | DATE | 是 | NOW | 创建时间 |

### 3.5 RoomFacility (房型设施关联表)
*   **表名**: `room_facilities`
*   **描述**: 房型与设施的多对多关联。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| room_type_id | UUID | 是 | - | 联合主键，外键 -> room_types.id |
| facility_id | STRING(50) | 是 | - | 联合主键，外键 -> facilities.id |
| created_at | DATE | 是 | NOW | 创建时间 |

### 3.6 RoomService (房型服务关联表)
*   **表名**: `room_services`
*   **描述**: 房型与服务的多对多关联。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| room_type_id | UUID | 是 | - | 联合主键，外键 -> room_types.id |
| service_id | STRING(50) | 是 | - | 联合主键，外键 -> services.id |
| created_at | DATE | 是 | NOW | 创建时间 |

---

## 4. 基础数据

### 4.1 Facility (设施字典表)
*   **表名**: `facilities`
*   **描述**: 存储所有可选的设施项。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| id | STRING(50) | 是 | - | 主键 |
| name | STRING(50) | 是 | - | 设施名称 |
| category | STRING(50) | 否 | - | 类别 |
| created_at | DATE | 是 | NOW | 创建时间 |
| updated_at | DATE | 是 | NOW | 更新时间 |

### 4.2 Service (服务字典表)
*   **表名**: `services`
*   **描述**: 存储所有可选的服务项。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| id | STRING(50) | 是 | - | 主键 |
| name | STRING(50) | 是 | - | 服务名称 |
| category | STRING(50) | 否 | - | 类别 |
| created_at | DATE | 是 | NOW | 创建时间 |
| updated_at | DATE | 是 | NOW | 更新时间 |

---

## 5. 订单与营销

### 5.1 Booking (订单表)
*   **表名**: `bookings`
*   **描述**: 存储用户的预订订单。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| id | UUID | 是 | UUIDV4 | 主键 |
| user_id | UUID | 是 | - | 外键 -> users.id |
| hotel_id | UUID | 是 | - | 外键 -> hotels.id |
| hotel_name | STRING(100) | 否 | - | 酒店名称快照 |
| room_type_id | UUID | 是 | - | 外键 -> room_types.id |
| room_type_name | STRING(50) | 是 | - | 房型名称快照 |
| check_in_date | DATEONLY | 是 | - | 入住日期 |
| check_out_date | DATEONLY | 是 | - | 离店日期 |
| total_price | DECIMAL(10, 2) | 是 | - | 总价 |
| original_total_price | DECIMAL(10, 2) | 否 | - | 原总价 |
| discount_amount | DECIMAL(10, 2) | 否 | - | 优惠金额 |
| currency | STRING(10) | 是 | CNY | 货币 |
| status | STRING(20) | 是 | - | 状态: pending, paid, completed, cancelled |
| contact_name | STRING(50) | 是 | - | 联系人 |
| contact_phone | STRING(20) | 是 | - | 联系电话 |
| special_requests | TEXT | 否 | - | 特殊要求 |
| booking_token | STRING(100) | 否 | - | 预订Token |
| order_number | STRING(50) | 否 | - | 订单号 |
| location_info | JSONB | 否 | - | 位置信息快照 |
| booked_at | DATE | 是 | NOW | 预订时间 |
| paid_at | DATE | 否 | - | 支付时间 |

### 5.2 Coupon (优惠券表)
*   **表名**: `coupons`
*   **描述**: 存储优惠券定义。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| id | UUID | 是 | UUIDV4 | 主键 |
| title | STRING(100) | 是 | - | 标题 |
| description | TEXT | 否 | - | 描述 |
| discount_type | STRING(20) | 是 | - | 类型: fixed, percentage |
| discount_value | DECIMAL(10, 2) | 是 | - | 优惠值 |
| min_order_amount | DECIMAL(10, 2) | 否 | - | 最低使用金额 |
| valid_from | DATEONLY | 是 | - | 有效期起 |
| valid_until | DATEONLY | 是 | - | 有效期止 |
| total_count | INTEGER | 是 | - | 发行总量 |
| used_count | INTEGER | 是 | 0 | 已使用数量 |
| is_new_user_only | BOOLEAN | 是 | false | 是否仅限新用户 |
| rules | TEXT | 否 | - | 规则详情 |
| created_at | DATE | 是 | NOW | 创建时间 |
| updated_at | DATE | 是 | NOW | 更新时间 |

### 5.3 UserCoupon (用户优惠券表)
*   **表名**: `user_coupons`
*   **描述**: 存储用户领取的优惠券。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| id | UUID | 是 | UUIDV4 | 主键 |
| user_id | UUID | 是 | - | 外键 -> users.id |
| coupon_id | UUID | 是 | - | 外键 -> coupons.id |
| booking_id | UUID | 否 | - | 外键 -> bookings.id |
| status | STRING(20) | 是 | - | 状态: available, used, expired |
| used_at | DATE | 否 | - | 使用时间 |
| created_at | DATE | 是 | NOW | 领取时间 |

### 5.4 Banner (轮播图表)
*   **表名**: `banners`
*   **描述**: 存储首页轮播图。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| id | STRING(50) | 是 | - | 主键 |
| image_url | STRING(500) | 是 | - | 图片URL |
| title | STRING(100) | 是 | - | 标题 |
| description | TEXT | 否 | - | 描述 |
| target_type | STRING(20) | 是 | - | 跳转类型: hotel, promotion, url |
| target_id | STRING(100) | 否 | - | 跳转目标ID |
| url | STRING(500) | 否 | - | 跳转URL |
| sort | INTEGER | 是 | 0 | 排序 |
| start_time | DATE | 是 | - | 开始时间 |
| end_time | DATE | 是 | - | 结束时间 |
| is_active | BOOLEAN | 是 | true | 是否启用 |
| created_at | DATE | 是 | NOW | 创建时间 |
| updated_at | DATE | 是 | NOW | 更新时间 |

---

## 6. 其他

### 6.1 Message (消息表)
*   **表名**: `messages`
*   **描述**: 存储系统消息或通知。

| 字段名 | 类型 | 必填 | 默认值 | 描述/约束 |
| :--- | :--- | :--- | :--- | :--- |
| id | UUID | 是 | UUIDV4 | 主键 |
| user_id | UUID | 是 | - | 外键 -> users.id |
| sender | STRING(50) | 是 | - | 发送者 |
| status | STRING(10) | 是 | 未读 | 状态: 已读, 未读 |
| content | JSONB | 是 | - | 消息内容 |
| created_at | DATE | 是 | NOW | 创建时间 |
