# 数据库文档

## 表结构设计

### 2.1 users 表

用户信息表，存储商户、管理员和手机端用户账号信息。

**表名:** `users`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | UUID | PRIMARY KEY | 用户ID |
| phone | VARCHAR(100) | UNIQUE, NOT NULL | 手机号 |
| password | VARCHAR(255) | NULL | 密码（加密存储，第三方登录用户可为空） |
| role | VARCHAR(20) | NOT NULL | 角色：merchant（商户）、admin（管理员）、mobile（手机端用户） |
| nickname | VARCHAR(50) | NULL | 昵称 |
| last_login_at | TIMESTAMP | NULL | 最后登录时间 |
| login_count | INTEGER | NOT NULL, DEFAULT 0 | 登录次数 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引:**
- `idx_users_phone`: UNIQUE INDEX (phone)
- `idx_users_role`: INDEX (role)

### 2.2 hotels 表

酒店信息表，存储酒店基本信息。

**表名:** `hotels`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | UUID | PRIMARY KEY | 酒店ID |
| hotel_name_cn | VARCHAR(100) | NOT NULL | 酒店中文名称 |
| hotel_name_en | VARCHAR(100) | NOT NULL | 酒店英文名称 |
| star_rating | INTEGER | NOT NULL, CHECK (star_rating >= 1 AND star_rating <= 5) | 酒店星级（1-5星） |
| rating | DECIMAL(3, 2) | NULL | 酒店评分（1-5分，保留2位小数） |
| review_count | INTEGER | NOT NULL, DEFAULT 0 | 评论数 |
| description | TEXT | NULL | 酒店描述 |
| phone | VARCHAR(20) | NULL | 酒店联系电话 |
| opening_date | DATE | NOT NULL | 开业时间 |
| nearby_info | TEXT | NULL | 周边信息（景点、交通等） |
| main_image_url | JSONB | NULL | 酒店主图片URL数组 |
| tags | JSONB | NULL | 酒店标签（如：亲子友好、免费停车场、含早餐） |
| location_info | JSONB | NULL | 位置信息（包含格式化地址、国家、省份、城市、区、街道、门牌号、经纬度坐标） |
| status | VARCHAR(20) | NOT NULL | 状态：draft（草稿）、pending（待审核）、auditing（审核中）、approved（已通过）、rejected（已拒绝）、published（已发布）、offline（已下线） |
| created_by | UUID | NOT NULL, FOREIGN KEY (users.id) | 创建人ID |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引:**
- `idx_hotels_created_by`: INDEX (created_by)
- `idx_hotels_status`: INDEX (status)
- `idx_hotels_hotel_name_cn`: INDEX (hotel_name_cn) - 全文索引

### 2.3 facilities 表

设施表，存储所有可选的设施类型。

**表名:** `facilities`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | VARCHAR(50) | PRIMARY KEY | 设施ID |
| name | VARCHAR(50) | NOT NULL | 设施名称 |
| category | VARCHAR(50) | NULL | 设施分类（如：房间设施、公共设施等） |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引:**
- `idx_facilities_category`: INDEX (category)

### 2.4 services 表

服务表，存储所有可选的服务类型。

**表名:** `services`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | VARCHAR(50) | PRIMARY KEY | 服务ID |
| name | VARCHAR(50) | NOT NULL | 服务名称 |
| category | VARCHAR(50) | NULL | 服务分类（如：前台服务、客房服务等） |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引:**
- `idx_services_category`: INDEX (category)

### 2.5 hotel_facilities 表

酒店设施关联表，记录酒店拥有的设施。

**表名:** `hotel_facilities`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| hotel_id | UUID | NOT NULL, FOREIGN KEY (hotels.id) ON DELETE CASCADE | 酒店ID |
| facility_id | VARCHAR(50) | NOT NULL, FOREIGN KEY (facilities.id) ON DELETE CASCADE | 设施ID |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |

**索引:**
- `idx_hotel_facilities_hotel_id`: INDEX (hotel_id)
- `idx_hotel_facilities_facility_id`: INDEX (facility_id)
- `uk_hotel_facility`: UNIQUE INDEX (hotel_id, facility_id) - 复合唯一索引

### 2.6 hotel_services 表

酒店服务关联表，记录酒店提供的服务。

**表名:** `hotel_services`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| hotel_id | UUID | NOT NULL, FOREIGN KEY (hotels.id) ON DELETE CASCADE | 酒店ID |
| service_id | VARCHAR(50) | NOT NULL, FOREIGN KEY (services.id) ON DELETE CASCADE | 服务ID |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |

**索引:**
- `idx_hotel_services_hotel_id`: INDEX (hotel_id)
- `idx_hotel_services_service_id`: INDEX (service_id)
- `uk_hotel_service`: UNIQUE INDEX (hotel_id, service_id) - 复合唯一索引

### 2.7 hotel_policies 表

酒店政策表，记录酒店的政策信息。

**表名:** `hotel_policies`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| hotel_id | UUID | PRIMARY KEY, FOREIGN KEY (hotels.id) ON DELETE CASCADE | 酒店ID |
| cancellation_policy | TEXT | NULL | 取消政策 |
| payment_policy | TEXT | NULL | 支付政策 |
| children_policy | TEXT | NULL | 儿童政策 |
| pets_policy | TEXT | NULL | 宠物政策 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

### 2.8 room_types 表

房型表，存储房型的详细信息。

**表名:** `room_types`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | UUID | PRIMARY KEY | 房型ID |
| hotel_id | UUID | NOT NULL, FOREIGN KEY (hotels.id) ON DELETE CASCADE | 酒店ID |
| room_type_name | VARCHAR(50) | NOT NULL | 房型名称（如：大床房、双床房、套房） |
| bed_type | VARCHAR(20) | NOT NULL | 床型：king（大床）、twin（双床）、queen（中床） |
| area | INTEGER | NOT NULL | 房间面积（平方米） |
| description | TEXT | NULL | 房间描述 |
| room_image_url | VARCHAR(500) | NULL | 房型图片URL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引:**
- `idx_room_types_hotel_id`: INDEX (hotel_id)
- `idx_room_types_room_type_name`: INDEX (room_type_name)
- `uk_hotel_room_type`: UNIQUE INDEX (hotel_id, room_type_name) - 复合唯一索引

### 2.9 room_facilities 表

房型设施关联表，记录房型拥有的设施。

**表名:** `room_facilities`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| room_type_id | UUID | NOT NULL, FOREIGN KEY (room_types.id) ON DELETE CASCADE | 房型ID |
| facility_id | VARCHAR(50) | NOT NULL, FOREIGN KEY (facilities.id) ON DELETE CASCADE | 设施ID |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |

**索引:**
- `idx_room_facilities_room_type_id`: INDEX (room_type_id)
- `idx_room_facilities_facility_id`: INDEX (facility_id)
- `uk_room_facility`: UNIQUE INDEX (room_type_id, facility_id) - 复合唯一索引

### 2.10 room_services 表

房型服务关联表，记录房型提供的服务。

**表名:** `room_services`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| room_type_id | UUID | NOT NULL, FOREIGN KEY (room_types.id) ON DELETE CASCADE | 房型ID |
| service_id | VARCHAR(50) | NOT NULL, FOREIGN KEY (services.id) ON DELETE CASCADE | 服务ID |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |

**索引:**
- `idx_room_services_room_type_id`: INDEX (room_type_id)
- `idx_room_services_service_id`: INDEX (service_id)
- `uk_room_service`: UNIQUE INDEX (room_type_id, service_id) - 复合唯一索引

### 2.11 room_prices 表

房型价格表，存储每个房型在不同日期的价格。

**表名:** `room_prices`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | UUID | PRIMARY KEY | 价格记录ID |
| room_type_id | UUID | NOT NULL, FOREIGN KEY (room_types.id) ON DELETE CASCADE | 房型ID |
| price_date | DATE | NOT NULL | 价格日期 |
| price | DECIMAL(10,2) | NOT NULL | 价格（保留2位小数） |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引:**
- `idx_room_prices_room_type_id`: INDEX (room_type_id)
- `idx_room_prices_price_date`: INDEX (price_date)
- `uk_room_type_date`: UNIQUE INDEX (room_type_id, price_date) - 复合唯一索引

### 2.12 room_tags 表

房型标签表，存储房型的标签。

**表名:** `room_tags`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | UUID | PRIMARY KEY | 标签ID |
| room_type_id | UUID | NOT NULL, FOREIGN KEY (room_types.id) ON DELETE CASCADE | 房型ID |
| tag_name | VARCHAR(50) | NOT NULL | 标签名称 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |

**索引:**
- `idx_room_tags_room_type_id`: INDEX (room_type_id)
- `idx_room_tags_tag_name`: INDEX (tag_name)

### 2.13 room_policies 表

房型政策表，存储房型的政策信息。

**表名:** `room_policies`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| room_type_id | UUID | PRIMARY KEY, FOREIGN KEY (room_types.id) ON DELETE CASCADE | 房型ID |
| cancellation_policy | TEXT | NULL | 取消政策 |
| payment_policy | TEXT | NULL | 支付政策 |
| children_policy | TEXT | NULL | 儿童政策 |
| pets_policy | TEXT | NULL | 宠物政策 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

### 2.14 audit_logs 表

审核日志表，记录酒店审核历史。

**表名:** `audit_logs`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | UUID | PRIMARY KEY | 审核记录ID |
| hotel_id | UUID | NOT NULL, FOREIGN KEY (hotels.id) | 酒店ID |
| auditor_id | UUID | NOT NULL, FOREIGN KEY (users.id) | 审核人ID |
| audited_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 审核时间 |
| result | VARCHAR(20) | NOT NULL | 审核结果：approved（通过）、rejected（拒绝） |
| reject_reason | TEXT | NULL | 拒绝原因（被拒绝时填写） |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 审核记录创建时间 |

**索引:**
- `idx_audit_logs_hotel_id`: INDEX (hotel_id)
- `idx_audit_logs_audited_at`: INDEX (audited_at)
- `idx_audit_logs_auditor_id`: INDEX (auditor_id)

### 2.15 hotel_history 表

酒店修改历史记录表，记录酒店信息变更历史。

**表名:** `hotel_history`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | UUID | PRIMARY KEY | 历史记录ID |
| hotel_id | UUID | NOT NULL, FOREIGN KEY (hotels.id) | 酒店ID |
| version | INTEGER | NOT NULL | 版本号 |
| modified_by | UUID | NOT NULL, FOREIGN KEY (users.id) | 修改人ID |
| modified_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 修改时间 |
| changes | JSONB | NOT NULL | 修改内容（JSON格式） |

**索引:**
- `idx_hotel_history_hotel_id`: INDEX (hotel_id)
- `idx_hotel_history_version`: INDEX (version)
- `idx_hotel_history_modified_at`: INDEX (modified_at)

### 2.16 user_profiles 表

用户资料表，存储手机端用户的详细资料信息。

**表名:** `user_profiles`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| user_id | UUID | PRIMARY KEY, FOREIGN KEY (users.id) ON DELETE CASCADE | 用户ID |
| nickname | VARCHAR(50) | NULL | 昵称 |
| gender | VARCHAR(10) | NULL | 性别：男、女 |
| birthday | DATE | NULL | 生日 |
| avatar | VARCHAR(500) | NULL | 头像URL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引:**
- `idx_user_profiles_nickname`: INDEX (nickname)

### 2.17 favorites 表

收藏表，存储用户收藏的酒店。

**表名:** `favorites`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | UUID | PRIMARY KEY | 收藏ID |
| user_id | UUID | NOT NULL, FOREIGN KEY (users.id) ON DELETE CASCADE | 用户ID |
| hotel_id | UUID | NOT NULL, FOREIGN KEY (hotels.id) ON DELETE CASCADE | 酒店ID |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 收藏时间 |

**索引:**
- `idx_favorites_user_id`: INDEX (user_id)
- `idx_favorites_hotel_id`: INDEX (hotel_id)
- `uk_user_hotel`: UNIQUE INDEX (user_id, hotel_id) - 复合唯一索引

### 2.18 bookings 表

预订表，存储用户的酒店预订记录。

**表名:** `bookings`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | UUID | PRIMARY KEY | 预订ID |
| user_id | UUID | NOT NULL, FOREIGN KEY (users.id) ON DELETE CASCADE | 用户ID |
| hotel_id | UUID | NOT NULL, FOREIGN KEY (hotels.id) ON DELETE CASCADE | 酒店ID |
| hotel_name | VARCHAR(100) | NULL | 酒店名称 |
| room_type_id | UUID | NOT NULL, FOREIGN KEY (room_types.id) ON DELETE CASCADE | 房型ID |
| room_type_name | VARCHAR(50) | NOT NULL | 房型名称（如：大床房、双床房、套房） |
| check_in_date | DATE | NOT NULL | 入住日期 |
| check_out_date | DATE | NOT NULL | 离店日期 |
| total_price | DECIMAL(10,2) | NOT NULL | 总价格（保留2位小数） |
| original_total_price | DECIMAL(10,2) | NULL | 原价 |
| discount_amount | DECIMAL(10,2) | NULL | 折扣金额 |
| currency | VARCHAR(10) | NOT NULL, DEFAULT 'CNY' | 货币类型 |
| status | VARCHAR(20) | NOT NULL | 状态：pending（待支付）、paid（已支付）、completed（已完成）、cancelled（已取消） |
| contact_name | VARCHAR(50) | NOT NULL | 联系人姓名 |
| contact_phone | VARCHAR(20) | NOT NULL | 联系人电话 |
| special_requests | TEXT | NULL | 特殊要求 |
| booking_token | VARCHAR(100) | NULL | 预订令牌（用于预订确认页） |
| order_number | VARCHAR(50) | NULL | 订单编号 |
| location_info | JSONB | NULL | 位置信息（包含格式化地址、国家、省份、城市、区、街道、门牌号、经纬度坐标） |
| booked_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 预订时间 |
| paid_at | TIMESTAMP | NULL | 支付时间 |

**索引:**
- `idx_bookings_user_id`: INDEX (user_id)
- `idx_bookings_hotel_id`: INDEX (hotel_id)
- `idx_bookings_status`: INDEX (status)
- `idx_bookings_check_in_date`: INDEX (check_in_date)
- `idx_bookings_check_out_date`: INDEX (check_out_date)
- `idx_bookings_booking_token`: INDEX (booking_token)
- `idx_bookings_order_number`: INDEX (order_number)

### 2.19 coupons 表

优惠券表，存储优惠券的定义信息。

**表名:** `coupons`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | UUID | PRIMARY KEY | 优惠券ID |
| title | VARCHAR(100) | NOT NULL | 优惠券标题 |
| description | TEXT | NULL | 优惠券描述 |
| discount_type | VARCHAR(20) | NOT NULL | 优惠类型：fixed（固定金额）、percentage（百分比） |
| discount_value | DECIMAL(10,2) | NOT NULL | 优惠值（固定金额或百分比） |
| min_order_amount | DECIMAL(10,2) | NULL | 最低订单金额 |
| valid_from | DATE | NOT NULL | 有效期开始日期 |
| valid_until | DATE | NOT NULL | 有效期结束日期 |
| total_count | INTEGER | NOT NULL | 总发行数量 |
| used_count | INTEGER | NOT NULL, DEFAULT 0 | 已使用数量 |
| is_new_user_only | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否仅限新用户 |
| rules | TEXT | NULL | 使用规则 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引:**
- `idx_coupons_valid_from`: INDEX (valid_from)
- `idx_coupons_valid_until`: INDEX (valid_until)
- `idx_coupons_is_new_user_only`: INDEX (is_new_user_only)

### 2.20 user_coupons 表

用户优惠券关联表，记录用户拥有的优惠券。

**表名:** `user_coupons`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | UUID | PRIMARY KEY | 用户优惠券ID |
| user_id | UUID | NOT NULL, FOREIGN KEY (users.id) ON DELETE CASCADE | 用户ID |
| coupon_id | UUID | NOT NULL, FOREIGN KEY (coupons.id) ON DELETE CASCADE | 优惠券ID |
| booking_id | UUID | NULL, FOREIGN KEY (bookings.id) ON DELETE SET NULL | 预订ID（使用优惠券时关联） |
| status | VARCHAR(20) | NOT NULL | 状态：available（可用）、used（已使用）、expired（已过期） |
| used_at | TIMESTAMP | NULL | 使用时间 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 领取时间 |

**索引:**
- `idx_user_coupons_user_id`: INDEX (user_id)
- `idx_user_coupons_coupon_id`: INDEX (coupon_id)
- `idx_user_coupons_status`: INDEX (status)
- `idx_user_coupons_booking_id`: INDEX (booking_id)

### 2.21 verification_codes 表

验证码表，存储手机验证码。

**表名:** `verification_codes`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | UUID | PRIMARY KEY | 验证码ID |
| phone | VARCHAR(100) | NOT NULL | 手机号 |
| code | VARCHAR(10) | NOT NULL | 验证码（6位数字） |
| type | VARCHAR(20) | NOT NULL | 类型：register（注册）、login（登录）、reset（重置密码） |
| expires_at | TIMESTAMP | NOT NULL | 过期时间 |
| used | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否已使用 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |

**索引:**
- `idx_verification_codes_phone`: INDEX (phone)
- `idx_verification_codes_expires_at`: INDEX (expires_at)

### 2.22 user_third_party_auth 表

第三方登录表，存储用户的第三方登录信息。

**表名:** `user_third_party_auth`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | UUID | PRIMARY KEY | 第三方登录ID |
| user_id | UUID | NOT NULL, FOREIGN KEY (users.id) ON DELETE CASCADE | 用户ID |
| provider | VARCHAR(20) | NOT NULL | 第三方平台：wechat（微信）、alipay（支付宝） |
| open_id | VARCHAR(100) | NOT NULL | 第三方平台开放ID |
| nickname | VARCHAR(50) | NULL | 第三方平台昵称 |
| avatar | VARCHAR(500) | NULL | 第三方平台头像 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引:**
- `idx_user_third_party_auth_user_id`: INDEX (user_id)
- `idx_user_third_party_auth_provider`: INDEX (provider)
- `idx_user_third_party_auth_open_id`: INDEX (open_id)
- `uk_provider_open_id`: UNIQUE INDEX (provider, open_id) - 复合唯一索引

### 2.23 banners 表

Banner管理表，存储首页推广广告Banner信息。

**表名:** `banners`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | VARCHAR(50) | PRIMARY KEY | BannerID |
| image_url | VARCHAR(500) | NOT NULL | Banner图片URL |
| title | VARCHAR(100) | NOT NULL | Banner标题 |
| description | TEXT | NULL | Banner描述 |
| target_type | VARCHAR(20) | NOT NULL | 目标类型：hotel（酒店）、promotion（优惠）、url（链接） |
| target_id | VARCHAR(100) | NULL | 目标ID |
| url | VARCHAR(500) | NULL | 目标链接（target_type为url时使用） |
| sort | INTEGER | NOT NULL, DEFAULT 0 | 排序权重 |
| start_time | TIMESTAMP | NOT NULL | 开始时间 |
| end_time | TIMESTAMP | NOT NULL | 结束时间 |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | 是否激活 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引:**
- `idx_banners_target_type`: INDEX (target_type)
- `idx_banners_sort`: INDEX (sort)
- `idx_banners_is_active`: INDEX (is_active)
- `idx_banners_time_range`: INDEX (start_time, end_time)

### 2.24 cities 表

城市表，存储城市定位信息。

**表名:** `cities`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | VARCHAR(50) | PRIMARY KEY | 城市ID |
| city_name | VARCHAR(100) | NOT NULL | 城市名称 |
| province | VARCHAR(50) | NULL | 省份 |
| latitude | DECIMAL(10, 7) | NULL | 纬度 |
| longitude | DECIMAL(10, 7) | NULL | 经度 |
| sort | INTEGER | NOT NULL, DEFAULT 0 | 排序权重 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引:**
- `idx_cities_city_name`: INDEX (city_name) - 全文索引
- `idx_cities_province`: INDEX (province)
- `idx_cities_sort`: INDEX (sort)

### 2.25 hotel_reviews 表

酒店评论表，存储用户对酒店的评论和评分。

**表名:** `hotel_reviews`

**字段说明:**
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|
| id | UUID | PRIMARY KEY | 评论ID |
| hotel_id | UUID | NOT NULL, FOREIGN KEY (hotels.id) ON DELETE CASCADE | 酒店ID |
| user_id | UUID | NOT NULL, FOREIGN KEY (users.id) ON DELETE CASCADE | 用户ID |
| room_type_id | UUID | NULL, FOREIGN KEY (room_types.id) ON DELETE SET NULL | 房型ID |
| booking_id | UUID | NULL, FOREIGN KEY (bookings.id) ON DELETE SET NULL | 预订ID |
| rating | DECIMAL(3, 2) | NOT NULL, CHECK (rating >= 1 AND rating <= 5) | 评分（1-5分，保留2位小数） |
| content | TEXT | NULL | 评论内容 |
| images | JSONB | NULL | 评论图片URL数组 |
| is_anonymous | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否匿名 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 评论时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引:**
- `idx_hotel_reviews_hotel_id`: INDEX (hotel_id)
- `idx_hotel_reviews_user_id`: INDEX (user_id)
- `idx_hotel_reviews_rating`: INDEX (rating)
- `idx_hotel_reviews_created_at`: INDEX (created_at)
- `uk_hotel_user_booking`: UNIQUE INDEX (hotel_id, user_id, booking_id) - 复合唯一索引（同一用户对同一预订只能评论一次）
