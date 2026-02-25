CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('merchant', 'admin', 'mobile')),
    nickname VARCHAR(50),
    last_login_at TIMESTAMP,
    login_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_name_cn VARCHAR(100) NOT NULL,
    hotel_name_en VARCHAR(100) NOT NULL,
    star_rating INTEGER NOT NULL CHECK (star_rating >= 1 AND star_rating <= 5),
    rating DECIMAL(3, 2),
    review_count INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    phone VARCHAR(20),
    opening_date DATE NOT NULL,
    nearby_info TEXT,
    main_image_url JSONB,
    image_urls JSONB,
    tags JSONB,
    location_info JSONB,
    min_price DECIMAL(10, 2),
    status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'pending', 'auditing', 'approved', 'rejected', 'published', 'offline')),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hotels_created_by ON hotels(created_by);
CREATE INDEX idx_hotels_status ON hotels(status);
CREATE INDEX idx_hotels_hotel_name_cn ON hotels USING gin(to_tsvector('simple', hotel_name_cn));

CREATE TABLE facilities (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_facilities_category ON facilities(category);

CREATE TABLE services (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_category ON services(category);

CREATE TABLE hotel_facilities (
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    facility_id VARCHAR(50) NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (hotel_id, facility_id)
);

CREATE INDEX idx_hotel_facilities_hotel_id ON hotel_facilities(hotel_id);
CREATE INDEX idx_hotel_facilities_facility_id ON hotel_facilities(facility_id);

CREATE TABLE hotel_services (
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    service_id VARCHAR(50) NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (hotel_id, service_id)
);

CREATE INDEX idx_hotel_services_hotel_id ON hotel_services(hotel_id);
CREATE INDEX idx_hotel_services_service_id ON hotel_services(service_id);

CREATE TABLE hotel_policies (
    hotel_id UUID PRIMARY KEY REFERENCES hotels(id) ON DELETE CASCADE,
    cancellation_policy TEXT,
    payment_policy TEXT,
    children_policy TEXT,
    pets_policy TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE room_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_type_name VARCHAR(50) NOT NULL,
    bed_type VARCHAR(20) NOT NULL CHECK (bed_type IN ('king', 'twin', 'queen')),
    area INTEGER NOT NULL,
    max_guests INTEGER NOT NULL DEFAULT 2,
    description TEXT,
    main_image_url VARCHAR(500),
    base_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (hotel_id, room_type_name)
);

CREATE INDEX idx_room_types_hotel_id ON room_types(hotel_id);
CREATE INDEX idx_room_types_room_type_name ON room_types(room_type_name);

CREATE TABLE room_facilities (
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    facility_id VARCHAR(50) NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (room_type_id, facility_id)
);

CREATE INDEX idx_room_facilities_room_type_id ON room_facilities(room_type_id);
CREATE INDEX idx_room_facilities_facility_id ON room_facilities(facility_id);

CREATE TABLE room_services (
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    service_id VARCHAR(50) NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (room_type_id, service_id)
);

CREATE INDEX idx_room_services_room_type_id ON room_services(room_type_id);
CREATE INDEX idx_room_services_service_id ON room_services(service_id);

CREATE TABLE room_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    price_date DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (room_type_id, price_date)
);

CREATE INDEX idx_room_prices_room_type_id ON room_prices(room_type_id);
CREATE INDEX idx_room_prices_price_date ON room_prices(price_date);

CREATE TABLE room_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_room_tags_room_type_id ON room_tags(room_type_id);
CREATE INDEX idx_room_tags_tag_name ON room_tags(tag_name);

CREATE TABLE room_policies (
    room_type_id UUID PRIMARY KEY REFERENCES room_types(id) ON DELETE CASCADE,
    cancellation_policy TEXT,
    payment_policy TEXT,
    children_policy TEXT,
    pets_policy TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id),
    auditor_id UUID NOT NULL REFERENCES users(id),
    audited_at TIMESTAMP NOT NULL DEFAULT NOW(),
    result VARCHAR(20) NOT NULL CHECK (result IN ('approved', 'rejected')),
    reject_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_hotel_id ON audit_logs(hotel_id);
CREATE INDEX idx_audit_logs_audited_at ON audit_logs(audited_at);
CREATE INDEX idx_audit_logs_auditor_id ON audit_logs(auditor_id);

CREATE TABLE hotel_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id),
    version INTEGER NOT NULL,
    modified_by UUID NOT NULL REFERENCES users(id),
    modified_at TIMESTAMP NOT NULL DEFAULT NOW(),
    changes JSONB NOT NULL
);

CREATE INDEX idx_hotel_history_hotel_id ON hotel_history(hotel_id);
CREATE INDEX idx_hotel_history_version ON hotel_history(version);
CREATE INDEX idx_hotel_history_modified_at ON hotel_history(modified_at);

CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    nickname VARCHAR(50),
    gender VARCHAR(10) CHECK (gender IN ('男', '女', '保密')),
    birthday DATE,
    avatar VARCHAR(500),
    avatar_base64 TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_nickname ON user_profiles(nickname);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender VARCHAR(50) NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('已读', '未读')) DEFAULT '未读',
    content JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, hotel_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_hotel_id ON favorites(hotel_id);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    hotel_name VARCHAR(100),
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    room_type_name VARCHAR(50) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    original_total_price DECIMAL(10, 2),
    discount_amount DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'CNY',
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'paid', 'completed', 'cancelled')),
    contact_name VARCHAR(50) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    special_requests TEXT,
    booking_token VARCHAR(100),
    order_number VARCHAR(50),
    location_info JSONB,
    booked_at TIMESTAMP NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMP
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_check_in_date ON bookings(check_in_date);
CREATE INDEX idx_bookings_check_out_date ON bookings(check_out_date);
CREATE INDEX idx_bookings_booking_token ON bookings(booking_token);
CREATE INDEX idx_bookings_order_number ON bookings(order_number);

CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('fixed', 'percentage')),
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2),
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    total_count INTEGER NOT NULL,
    used_count INTEGER NOT NULL DEFAULT 0,
    is_new_user_only BOOLEAN NOT NULL DEFAULT FALSE,
    rules TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_valid_from ON coupons(valid_from);
CREATE INDEX idx_coupons_valid_until ON coupons(valid_until);
CREATE INDEX idx_coupons_is_new_user_only ON coupons(is_new_user_only);

CREATE TABLE user_coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'used', 'expired')),
    used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_coupons_user_id ON user_coupons(user_id);
CREATE INDEX idx_user_coupons_coupon_id ON user_coupons(coupon_id);
CREATE INDEX idx_user_coupons_status ON user_coupons(status);
CREATE INDEX idx_user_coupons_booking_id ON user_coupons(booking_id);

CREATE TABLE verification_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('register', 'login', 'reset')),
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verification_codes_phone ON verification_codes(phone);
CREATE INDEX idx_verification_codes_expires_at ON verification_codes(expires_at);

CREATE TABLE user_third_party_auth (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('wechat', 'alipay')),
    open_id VARCHAR(100) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (provider, open_id)
);

CREATE INDEX idx_user_third_party_auth_user_id ON user_third_party_auth(user_id);
CREATE INDEX idx_user_third_party_auth_provider ON user_third_party_auth(provider);
CREATE INDEX idx_user_third_party_auth_open_id ON user_third_party_auth(open_id);

CREATE TABLE banners (
    id VARCHAR(50) PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('hotel', 'promotion', 'url')),
    target_id VARCHAR(100),
    url VARCHAR(500),
    sort INTEGER NOT NULL DEFAULT 0,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_banners_target_type ON banners(target_type);
CREATE INDEX idx_banners_sort ON banners(sort);
CREATE INDEX idx_banners_is_active ON banners(is_active);
CREATE INDEX idx_banners_time_range ON banners(start_time, end_time);

CREATE TABLE cities (
    id VARCHAR(50) PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL,
    province VARCHAR(50),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    sort INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cities_city_name ON cities USING gin(to_tsvector('simple', city_name));
CREATE INDEX idx_cities_province ON cities(province);
CREATE INDEX idx_cities_sort ON cities(sort);

CREATE TABLE hotel_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_type_id UUID REFERENCES room_types(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    rating DECIMAL(3, 2) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    images JSONB,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hotel_reviews_hotel_id ON hotel_reviews(hotel_id);
CREATE INDEX idx_hotel_reviews_user_id ON hotel_reviews(user_id);
CREATE INDEX idx_hotel_reviews_rating ON hotel_reviews(rating);
CREATE INDEX idx_hotel_reviews_created_at ON hotel_reviews(created_at);
CREATE UNIQUE INDEX uk_hotel_user_booking ON hotel_reviews(hotel_id, user_id, booking_id);

-- 用户浏览历史表
CREATE TABLE histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_histories_user_id ON histories(user_id);
CREATE INDEX idx_histories_hotel_id ON histories(hotel_id);
CREATE INDEX idx_histories_viewed_at ON histories(viewed_at);
