const { Op, where, literal } = require('sequelize');
const { Hotel, HotelFacility, HotelService, HotelPolicy, RoomType, RoomPrice, HotelReview, Facility, Service, RoomTag, RoomFacility, RoomService, RoomPolicy, Favorite, Booking } = require('../../models');

const searchHotelsService = async (params) => {
  const { city, check_in, check_out, guests, min_price, max_price, star_rating, facilities, sort_by, page = 1, size = 20 } = params;

  const whereClause = {
    status: 'published'
  };

  // 添加城市筛选
  if (city) {
    // 构建更灵活的城市匹配条件
    const cityLikeCondition = city.includes('市') ? city : `${city}市`;
    whereClause[Op.or] = [
      // 精确匹配城市名称
      where(literal(`"Hotel"."location_info"->>'city'`), city),
      // 匹配包含"市"后缀的城市名称
      where(literal(`"Hotel"."location_info"->>'city'`), cityLikeCondition),
      // 模糊匹配城市名称（去除"市"后缀）
      where(literal(`"Hotel"."location_info"->>'city'`), { [Op.iLike]: `%${city}%` }),
      // 模糊匹配格式化地址
      where(literal(`"Hotel"."location_info"->>'formatted_address'`), { [Op.iLike]: `%${city}%` }),
      // 匹配省份（有些城市名称和省份名称相同）
      where(literal(`"Hotel"."location_info"->>'province'`), { [Op.iLike]: `%${city}%` })
    ];
  }

  // 添加星级筛选
  if (star_rating) {
    whereClause.star_rating = star_rating;
  }

  // 计算偏移量
  const offset = (page - 1) * size;

  // 构建查询选项
  const queryOptions = {
    where: whereClause,
    include: [
      {
        model: HotelFacility,
        as: 'hotelFacilities',
        include: [{
          model: Facility,
          as: 'facility',
          attributes: ['id', 'name']
        }],
        attributes: ['facility_id']
      },
      {
        model: HotelService,
        as: 'hotelServices',
        include: [{
          model: Service,
          as: 'service',
          attributes: ['id', 'name']
        }],
        attributes: ['service_id']
      }
    ],
    order: sort_by === 'price_asc' ? [[literal('min_price'), 'ASC']] : [['created_at', 'DESC']],
    limit: size,
    offset: offset,
    attributes: ['id', 'hotel_name_cn', 'star_rating', 'rating', 'location_info', 'description', 'main_image_url', 'created_at']
  };

  // 并行执行查询，提高性能
  const [hotels, total] = await Promise.all([
    Hotel.findAll(queryOptions),
    Hotel.count({ where: whereClause })
  ]);

  // 格式化酒店数据
  const formattedHotels = await Promise.all(hotels.map(async (hotel) => {
    const facilities = hotel.hotelFacilities.map(hf => ({
      id: hf.facility_id,
      name: hf.facility?.name || ''
    }));

    const services = hotel.hotelServices.map(hs => ({
      id: hs.service_id,
      name: hs.service?.name || ''
    }));

    // 处理主图片URL
    let mainImageUrl = hotel.main_image_url?.[0] || '';
    if (!mainImageUrl || mainImageUrl.includes('example.com')) {
      mainImageUrl = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20exterior%20building%20architecture&image_size=landscape_4_3';
    }

    // 从数据库获取最低价格
    const roomTypes = await RoomType.findAll({
      where: { hotel_id: hotel.id }
    });

    let minPrice = 259.00; // 默认价格
    if (roomTypes.length > 0) {
      // 获取所有房型的价格
      const roomPrices = await Promise.all(roomTypes.map(async (roomType) => {
        const prices = await RoomPrice.findAll({
          where: { room_type_id: roomType.id },
          attributes: ['price']
        });
        return prices.map(p => p.price);
      }));

      // 扁平化价格数组
      const allPrices = roomPrices.flat();
      if (allPrices.length > 0) {
        minPrice = Math.min(...allPrices);
      }
    }

    return {
      id: hotel.id,
      name: hotel.hotel_name_cn,
      star: hotel.star_rating,
      rating: hotel.rating || 0,
      address: hotel.location_info?.formatted_address || '',
      distance: Math.random() * 5, // 模拟距离
      description: hotel.description,
      main_image_url: mainImageUrl,
      image: mainImageUrl, // 兼容前端使用的image字段
      imageUrl: mainImageUrl, // 兼容前端使用的imageUrl字段
      min_price: minPrice,
      facilities,
      services
    };
  }));

  return {
    total,
    page,
    size,
    list: formattedHotels
  };
};

const getHotelDetailService = async (hotel_id, params = {}) => {
  // 解析日期参数
  const { check_in_date, check_out_date, check_in, check_out, checkInDate, checkOutDate } = params;
  
  // 验证酒店ID
  if (!hotel_id || hotel_id === 'undefined' || hotel_id === 'null') {
    const error = new Error('酒店id不能为空');
    error.code = 400;
    error.httpStatus = 400;
    throw error;
  }

  // 构建查询选项
  const queryOptions = {
    where: { id: hotel_id },
    include: [
      {
        model: HotelFacility,
        as: 'hotelFacilities',
        include: [{
          model: Facility,
          as: 'facility',
          attributes: ['id', 'name']
        }],
        attributes: ['facility_id']
      },
      {
        model: HotelService,
        as: 'hotelServices',
        include: [{
          model: Service,
          as: 'service',
          attributes: ['id', 'name']
        }],
        attributes: ['service_id']
      },
      {
        model: HotelPolicy,
        as: 'policy',
        attributes: ['cancellation_policy', 'payment_policy', 'children_policy', 'pets_policy']
      }
    ],
    attributes: ['id', 'hotel_name_cn', 'hotel_name_en', 'star_rating', 'rating', 'location_info', 'description', 'phone', 'opening_date', 'nearby_info', 'main_image_url', 'tags']
  };
  
  // 并行执行查询，提高性能
  const [hotel, roomTypes, reviewCount, favoriteCount, bookingCount] = await Promise.all([
    Hotel.findOne(queryOptions),
    RoomType.findAll({
      where: { hotel_id },
      attributes: ['id', 'room_type_name', 'bed_type', 'area', 'description', 'room_image_url'],
      include: [
        {
          model: RoomTag,
          as: 'roomTags',
          attributes: ['tag_name']
        },
        {
          model: RoomFacility,
          as: 'roomFacilities',
          include: [{
            model: Facility,
            as: 'facility',
            attributes: ['id', 'name']
          }]
        },
        {
          model: RoomService,
          as: 'roomServices',
          include: [{
            model: Service,
            as: 'service',
            attributes: ['id', 'name']
          }]
        },
        {
          model: RoomPolicy,
          as: 'policy'
        }
      ]
    }),
    HotelReview.count({ where: { hotel_id } }),
    Favorite.count({ where: { hotel_id } }),
    Booking.count({ where: { hotel_id } })
  ]);

  if (!hotel) {
    const error = new Error('酒店不存在');
    error.code = 4010;
    error.httpStatus = 404;
    throw error;
  }

  // 格式化设施
  const facilities = hotel.hotelFacilities.map(hf => ({
    id: hf.facility_id,
    name: hf.facility?.name || ''
  }));

  // 格式化服务
  const services = hotel.hotelServices.map(hs => ({
    id: hs.service_id,
    name: hs.service?.name || ''
  }));

  // 格式化政策
  const policies = {
    cancellation: hotel.policy?.cancellation_policy || '入住前24小时免费取消',
    payment: hotel.policy?.payment_policy || '支持信用卡及移动支付',
    children: hotel.policy?.children_policy || '12岁以下免费入住',
    pets: hotel.policy?.pets_policy || '不可携带宠物'
  };

  // 格式化房型
  const roomTypesWithPrices = await Promise.all(
    roomTypes.map(async (roomType) => {
      // 从数据库获取价格
      const roomPrices = await RoomPrice.findAll({
        where: { room_type_id: roomType.id },
        attributes: ['price_date', 'price']
      });

      // 转换为前端需要的格式
      const prices = roomPrices.map(rp => ({
        date: rp.price_date,
        price: rp.price
      }));

      // 如果数据库中没有价格，使用默认价格
      if (prices.length === 0) {
        prices.push({
          date: new Date().toISOString().split('T')[0],
          price: 259.00 // 默认价格
        });
      }

      return {
        id: roomType.id,
        name: roomType.room_type_name,
        room_type_name: roomType.room_type_name,
        bed_type: roomType.bed_type,
        area: roomType.area,
        description: roomType.description,
        room_image_url: roomType.room_image_url || '',
        tags: (roomType.roomTags || []).map(t => t.tag_name),
        facilities: (roomType.roomFacilities || []).map(rf => ({
          id: rf.facility?.id,
          name: rf.facility?.name
        })).filter(f => f.id && f.name),
        services: (roomType.roomServices || []).map(rs => ({
          id: rs.service?.id,
          name: rs.service?.name
        })).filter(s => s.id && s.name),
        policies: {
          cancellation: roomType.policy?.cancellation_policy || '不可取消',
          payment: roomType.policy?.payment_policy || '在线支付',
          children: roomType.policy?.children_policy || '不允许携带儿童',
          pets: roomType.policy?.pets_policy || '不允许携带宠物'
        },
        prices
      };
    })
  );

  // 计算日期区间内的最低价格
  // 如果没有提供日期，默认为今天入住，明天离店
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const checkIn = check_in || check_in_date || checkInDate || today.toISOString().split('T')[0];
  const checkOut = check_out || check_out_date || checkOutDate || tomorrow.toISOString().split('T')[0];

  let minPrice = 259.00; // 默认价格

  if (roomTypes.length > 0) {
    // 获取每个房型在指定日期区间内的价格
    const roomTypePrices = await Promise.all(roomTypes.map(async (roomType) => {
      const prices = await RoomPrice.findAll({
        where: {
          room_type_id: roomType.id,
          price_date: {
            [Op.gte]: checkIn,
            [Op.lt]: checkOut
          }
        },
        attributes: ['price']
      });

      if (prices.length === 0) return null;

      // 计算该房型的平均价格
      const sum = prices.reduce((acc, curr) => acc + parseFloat(curr.price), 0);
      return sum / prices.length;
    }));

    // 过滤掉没有价格的房型
    const validPrices = roomTypePrices.filter(p => p !== null);

    if (validPrices.length > 0) {
      // 取所有房型平均价格中的最小值
      minPrice = Math.min(...validPrices);
    }
  }

  // 处理主图片URL
  let mainImageUrl = hotel.main_image_url || [];
  if (Array.isArray(mainImageUrl)) {
    mainImageUrl = mainImageUrl.map(url => {
      if (!url || url.includes('example.com')) {
        return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20exterior%20building%20architecture&image_size=landscape_4_3';
      }
      return url;
    });
  } else if (!mainImageUrl || mainImageUrl.includes('example.com')) {
    mainImageUrl = ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20exterior%20building%20architecture&image_size=landscape_4_3'];
  }

  return {
    hotel_id: hotel.id,
    hotel_name_cn: hotel.hotel_name_cn,
    hotel_name_en: hotel.hotel_name_en,
    star_rating: hotel.star_rating,
    rating: hotel.rating || 0,
    review_count: reviewCount || 0,
    description: hotel.description,
    phone: hotel.phone || '',
    opening_date: hotel.opening_date || '',
    nearby_info: hotel.nearby_info || '',
    main_image_url: mainImageUrl,
    tags: hotel.tags || [],
    location_info: hotel.location_info || {},
    favorite_count: favoriteCount || 0,
    booking_count: bookingCount || 0,
    facilities,
    services,
    policies,
    room_types: roomTypesWithPrices,
    min_price: parseFloat(minPrice.toFixed(2))
  };
};

const getHotelImagesService = async (hotel_id, type) => {
  // 从数据库获取酒店图片
  const hotel = await Hotel.findOne({
    where: { id: hotel_id },
    attributes: ['id', 'image_urls']
  });

  if (!hotel) {
    const error = new Error('酒店不存在');
    error.code = 404;
    error.httpStatus = 404;
    throw error;
  }

  // 格式化图片数据
  let images = [];
  if (hotel.image_urls && Array.isArray(hotel.image_urls)) {
    images = hotel.image_urls.map((url, index) => ({
      id: index + 1,
      url: url,
      type: 'exterior', // 默认为外观图片，实际项目中可以根据图片路径或其他方式区分
      order: index + 1
    }));
  }

  // 根据类型筛选
  if (type) {
    images = images.filter(img => img.type === type);
  }

  return images;
};

const getHotelAvailabilityService = async (hotel_id, start_date, end_date) => {
  // 验证日期参数
  if (!start_date || !end_date) {
    const error = new Error('请提供开始日期和结束日期');
    error.code = 400;
    error.httpStatus = 400;
    throw error;
  }

  // 从数据库获取房型和价格信息
  const roomTypes = await RoomType.findAll({
    where: { hotel_id },
    attributes: ['id']
  });

  // 模拟可用日期和价格数据
  const availability = [];
  const start = new Date(start_date);
  const end = new Date(end_date);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    availability.push({
      date: d.toISOString().split('T')[0],
      available: Math.random() > 0.1, // 90% 的概率可用
      price: Math.floor(200 + Math.random() * 300) // 随机价格
    });
  }

  return {
    hotel_id,
    start_date,
    end_date,
    availability
  };
};

const calculatePriceService = async (hotel_id, check_in, check_out, room_type_id, guests) => {
  // 验证参数
  if (!check_in || !check_out || !room_type_id || !guests) {
    const error = new Error('请提供完整的预订信息');
    error.code = 400;
    error.httpStatus = 400;
    throw error;
  }

  // 计算入住天数
  const startDate = new Date(check_in);
  const endDate = new Date(check_out);
  const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  // 从数据库获取房型价格
  const roomPrice = await RoomPrice.findOne({
    where: { room_type_id },
    attributes: ['price']
  });

  const basePrice = roomPrice?.price || 300;
  const totalPrice = basePrice * nights;
  const serviceFee = Math.floor(totalPrice * 0.1); // 10% 服务费
  const tax = Math.floor(totalPrice * 0.06); // 6% 税费
  const grandTotal = totalPrice + serviceFee + tax;

  return {
    hotel_id,
    room_type_id,
    check_in,
    check_out,
    nights,
    guests,
    price_details: {
      room_price: basePrice,
      total_room_price: totalPrice,
      service_fee: serviceFee,
      tax: tax,
      grand_total: grandTotal
    }
  };
};

const getRoomTypesService = async (hotel_id, check_in, check_out) => {
  // 从数据库获取房型信息
  const roomTypes = await RoomType.findAll({
    where: { hotel_id },
    attributes: ['id', 'room_type_name', 'description', 'bed_type', 'area', 'max_guests', 'base_price', 'main_image_url'],
    include: [
      {
        model: RoomTag,
        as: 'roomTags',
        attributes: ['tag_name']
      },
      {
        model: RoomFacility,
        as: 'roomFacilities',
        include: [{
          model: Facility,
          as: 'facility',
          attributes: ['id', 'name']
        }]
      },
      {
        model: RoomService,
        as: 'roomServices',
        include: [{
          model: Service,
          as: 'service',
          attributes: ['id', 'name']
        }]
      },
      {
        model: RoomPolicy,
        as: 'policy'
      }
    ]
  });

  // 格式化房型数据
  const formattedRoomTypes = roomTypes.map(roomType => ({
    id: roomType.id,
    name: roomType.room_type_name,
    description: roomType.description,
    bed_type: roomType.bed_type,
    area: roomType.area,
    max_guests: roomType.max_guests,
    base_price: roomType.base_price,
    main_image_url: roomType.main_image_url,
    tags: (roomType.roomTags || []).map(t => t.tag_name),
    facilities: (roomType.roomFacilities || []).map(rf => ({
      id: rf.facility?.id,
      name: rf.facility?.name
    })).filter(f => f.id && f.name),
    services: (roomType.roomServices || []).map(rs => ({
      id: rs.service?.id,
      name: rs.service?.name
    })).filter(s => s.id && s.name),
    policies: [
      { id: 1, type: 'check_in', value: '14:00后' },
      { id: 2, type: 'check_out', value: '12:00前' },
      { id: 3, type: 'cancellation', value: roomType.policy?.cancellation_policy || '入住前24小时可免费取消' },
      { id: 4, type: 'payment', value: roomType.policy?.payment_policy || '在线支付' }
    ]
  }));

  return formattedRoomTypes;
};

const getRoomTypeDetailService = async (hotel_id, room_type_id, check_in, check_out) => {
  // 从数据库获取房型详情
  const roomType = await RoomType.findOne({
    where: { id: room_type_id, hotel_id },
    attributes: ['id', 'room_type_name', 'description', 'bed_type', 'area', 'max_guests', 'base_price', 'main_image_url'],
    include: [
      {
        model: RoomTag,
        as: 'roomTags',
        attributes: ['tag_name']
      },
      {
        model: RoomFacility,
        as: 'roomFacilities',
        include: [{
          model: Facility,
          as: 'facility',
          attributes: ['id', 'name']
        }]
      },
      {
        model: RoomService,
        as: 'roomServices',
        include: [{
          model: Service,
          as: 'service',
          attributes: ['id', 'name']
        }]
      },
      {
        model: RoomPolicy,
        as: 'policy'
      }
    ]
  });

  if (!roomType) {
    const error = new Error('房型不存在');
    error.code = 404;
    error.httpStatus = 404;
    throw error;
  }

  // 格式化房型详情数据
  return {
    id: roomType.id,
    name: roomType.room_type_name,
    description: roomType.description,
    bed_type: roomType.bed_type,
    area: roomType.area,
    max_guests: roomType.max_guests,
    base_price: roomType.base_price,
    main_image_url: roomType.main_image_url,
    tags: (roomType.roomTags || []).map(t => t.tag_name),
    facilities: (roomType.roomFacilities || []).map(rf => ({
      id: rf.facility?.id,
      name: rf.facility?.name
    })).filter(f => f.id && f.name),
    services: (roomType.roomServices || []).map(rs => ({
      id: rs.service?.id,
      name: rs.service?.name
    })).filter(s => s.id && s.name),
    policies: [
      { id: 1, type: 'check_in', value: '14:00后' },
      { id: 2, type: 'check_out', value: '12:00前' },
      { id: 3, type: 'cancellation', value: roomType.policy?.cancellation_policy || '入住前24小时可免费取消' },
      { id: 4, type: 'payment', value: roomType.policy?.payment_policy || '在线支付' },
      { id: 5, type: 'children', value: roomType.policy?.children_policy || '不允许携带儿童' },
      { id: 6, type: 'pets', value: roomType.policy?.pets_policy || '不允许携带宠物' }
    ]
  };
};

const getHotelListService = async (params) => {
  console.log('=== Start getHotelListService ===');
  console.log('Get hotel list params:', params);
  
  try {
    // 处理前端传递的参数，支持不同的参数名
    const {
      page = 1,
      pageSize = 10,
      location,
      city, // 前端传递的城市参数
      cityName, // 可能的城市参数名
      destination, // 可能的城市参数名
      check_in_date,
      check_out_date,
      check_in, // 前端可能传递的参数名
      check_out, // 前端可能传递的参数名
      dateRange, // 可能的日期范围参数
      star_rating,
      starLevels, // 可能的星级参数名
      stars, // 可能的星级参数名
      minPrice,
      maxPrice,
      min_price, // 前端可能传递的参数名
      max_price, // 前端可能传递的参数名
      max_min_price, // 新增：能接收的最高的酒店最低价筛选
      priceRange, // 可能的价格范围参数
      rating,
      minRating, // 前端传递的参数名
      facilities,
      amenities, // 可能的设施参数名
      services,
      tags,
      nearby_info,
      keyword,
      searchText, // 可能的关键词参数名
      sort, // 前端传递的排序参数
      sort_by, // 前端可能传递的参数名
      orderBy, // 可能的排序参数名
      // 新增：处理前端传递的selectedTags和selectedFacilities参数
      selectedTags, // 前端传递的选中标签
      selectedFacilities, // 前端传递的选中设施
      selectedFilterValue, // 前端传递的选中筛选值
      currentFilterType, // 前端传递的当前筛选类型
      // 新增：处理更多可能的参数名
      checkInDate, // 前端传递的入住日期参数名
      checkOutDate, // 前端传递的离店日期参数名
      destinationCity, // 可能的目的地城市参数名
      searchKeyword, // 可能的搜索关键词参数名
      sortType, // 可能的排序类型参数名
      orderType // 可能的排序顺序参数名
    } = params;

    console.log('Parsed params:', {
      page,
      pageSize,
      location,
      city,
      cityName,
      destination,
      check_in_date,
      check_out_date,
      check_in,
      check_out,
      checkInDate,
      checkOutDate,
      dateRange,
      star_rating,
      starLevels,
      stars,
      minPrice,
      maxPrice,
      min_price,
      max_price,
      max_min_price,
      priceRange,
      rating,
      minRating,
      facilities,
      amenities,
      services,
      tags,
      selectedTags,
      selectedFacilities,
      selectedFilterValue,
      currentFilterType,
      nearby_info,
      keyword,
      searchText,
      searchKeyword,
      sort,
      sort_by,
      orderBy,
      sortType,
      orderType
    });

    // 构建查询条件
    const whereCondition = {
      status: 'published' // 只返回已发布的酒店
    };

    // 构建 AND 条件数组
    const andConditions = [];

    // 城市筛选 - 支持多种参数名
    const cityFilter = location || city || cityName || destination || destinationCity;
    if (cityFilter) {
      console.log('Adding city filter:', cityFilter);
      const cityLikeCondition = cityFilter.includes('市') ? cityFilter : `${cityFilter}市`;
      const cityOrConditions = [
        where(literal(`"Hotel"."location_info"->>'city'`), cityFilter),
        where(literal(`"Hotel"."location_info"->>'city'`), cityLikeCondition),
        where(literal(`"Hotel"."location_info"->>'city'`), { [Op.iLike]: `%${cityFilter}%` }),
        where(literal(`"Hotel"."location_info"->>'formatted_address'`), { [Op.iLike]: `%${cityFilter}%` }),
        where(literal(`"Hotel"."location_info"->>'province'`), { [Op.iLike]: `%${cityFilter}%` })
      ];
      andConditions.push({ [Op.or]: cityOrConditions });
    }

    // 关键词搜索 - 支持多种参数名
    const keywordFilter = keyword || searchText || searchKeyword;
    if (keywordFilter) {
      console.log('Adding keyword filter:', keywordFilter);
      const keywordOrConditions = [
        { hotel_name_cn: { [Op.iLike]: `%${keywordFilter}%` } },
        { hotel_name_en: { [Op.iLike]: `%${keywordFilter}%` } },
        { description: { [Op.iLike]: `%${keywordFilter}%` } },
        where(literal(`"Hotel"."location_info"->>'formatted_address'`), { [Op.iLike]: `%${keywordFilter}%` }),
        { nearby_info: { [Op.iLike]: `%${keywordFilter}%` } },
        where(literal(`"Hotel"."tags"::text`), { [Op.iLike]: `%${keywordFilter}%` })
      ];
      andConditions.push({ [Op.or]: keywordOrConditions });
    }

    if (andConditions.length > 0) {
      whereCondition[Op.and] = andConditions;
      console.log('Added AND conditions:', andConditions.length);
    }

    // 星级筛选 - 支持多种参数名
    const starFilter = star_rating || starLevels || stars;
    if (starFilter) {
      console.log('Adding star rating filter:', starFilter);
      // 处理数组格式的星级参数
      if (Array.isArray(starFilter)) {
        whereCondition.star_rating = { [Op.in]: starFilter };
      } else if (typeof starFilter === 'string' && starFilter.includes(',')) {
        // 处理逗号分隔的字符串格式
        const starArray = starFilter.split(',').map(s => parseInt(s)).filter(s => !isNaN(s));
        whereCondition.star_rating = { [Op.in]: starArray };
      } else {
        whereCondition.star_rating = starFilter;
      }
    } else if (selectedFilterValue && currentFilterType === 'star') {
      // 处理前端传递的selectedFilterValue和currentFilterType参数
      console.log('Adding star rating filter from selectedFilterValue:', selectedFilterValue);
      const starLevel = parseInt(selectedFilterValue);
      if (!isNaN(starLevel)) {
        whereCondition.star_rating = starLevel;
      }
    }

    // 评分筛选（支持前端传递的 minRating 参数）
    const ratingValue = rating || minRating;
    if (ratingValue) {
      console.log('Adding rating filter:', ratingValue);
      whereCondition.rating = { [Op.gte]: ratingValue };
    }

    // 周边信息筛选
    if (nearby_info) {
      console.log('Adding nearby info filter:', nearby_info);
      whereCondition.nearby_info = { [Op.iLike]: `%${nearby_info}%` };
    }

    console.log('Final where condition:', whereCondition);

    // 计算偏移量
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    console.log('Pagination:', { page, pageSize, offset });

    // 构建排序条件
    let orderCondition = [['created_at', 'DESC']];
    const sortParam = sort || sort_by || orderBy || sortType || orderType;
    if (sortParam === 'rating' || sortParam === 'rating_desc') {
      orderCondition = [['rating', 'DESC']];
    } else if (sortParam === 'price_asc') {
      orderCondition = [[literal('min_price'), 'ASC']];
    } else if (sortParam === 'price_desc') {
      orderCondition = [[literal('min_price'), 'DESC']];
    } else if (sortParam === 'distance') {
      // 距离排序（需要根据实际情况实现）
      orderCondition = [['created_at', 'DESC']];
    }
    console.log('Order condition:', orderCondition);

    // 并行执行查询，提高性能
    console.log('Executing Hotel.findAll...');
    const [hotels, total] = await Promise.all([
      Hotel.findAll({
        where: whereCondition,
        limit: parseInt(pageSize),
        offset: offset,
        order: orderCondition,
        attributes: ['id', 'hotel_name_cn', 'hotel_name_en', 'star_rating', 'rating', 'nearby_info', 'main_image_url', 'tags', 'location_info']
      }),
      Hotel.count({ where: whereCondition })
    ]);

    console.log('Found hotels:', hotels.length, 'total:', total);

    const hotelIds = hotels.map(hotel => hotel.id);
    const [hotelFacilityRows, hotelServiceRows] = await Promise.all([
      hotelIds.length
        ? HotelFacility.findAll({
            where: { hotel_id: { [Op.in]: hotelIds } },
            include: [{
              model: Facility,
              as: 'facility',
              attributes: ['id', 'name']
            }],
            attributes: ['hotel_id', 'facility_id']
          })
        : Promise.resolve([]),
      hotelIds.length
        ? HotelService.findAll({
            where: { hotel_id: { [Op.in]: hotelIds } },
            include: [{
              model: Service,
              as: 'service',
              attributes: ['id', 'name']
            }],
            attributes: ['hotel_id', 'service_id']
          })
        : Promise.resolve([])
    ]);

    const facilitiesByHotelId = new Map();
    hotelFacilityRows.forEach(row => {
      const hotelId = row.hotel_id;
      if (!facilitiesByHotelId.has(hotelId)) {
        facilitiesByHotelId.set(hotelId, []);
      }
      facilitiesByHotelId.get(hotelId).push({
        id: row.facility_id,
        name: row.facility?.name || ''
      });
    });

    const servicesByHotelId = new Map();
    hotelServiceRows.forEach(row => {
      const hotelId = row.hotel_id;
      if (!servicesByHotelId.has(hotelId)) {
        servicesByHotelId.set(hotelId, []);
      }
      servicesByHotelId.get(hotelId).push({
        id: row.service_id,
        name: row.service?.name || ''
      });
    });

    // 格式化酒店数据
    let formattedHotels = await Promise.all(hotels.map(async (hotel) => {
      const facilities = facilitiesByHotelId.get(hotel.id) || [];
      const services = servicesByHotelId.get(hotel.id) || [];
      // 处理主图片URL
      let mainImageUrl = hotel.main_image_url || [];
      if (Array.isArray(mainImageUrl)) {
        mainImageUrl = mainImageUrl.map(url => {
          if (!url || url.includes('example.com')) {
            return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20exterior%20building%20architecture&image_size=landscape_4_3';
          }
          return url;
        });
      } else if (!mainImageUrl || mainImageUrl.includes('example.com')) {
        mainImageUrl = ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20exterior%20building%20architecture&image_size=landscape_4_3'];
      }

      // 从数据库获取最低价格
      const roomTypes = await RoomType.findAll({
        where: { hotel_id: hotel.id }
      });

      let minPrice = 259.00; // 默认价格
      
      // 计算日期范围内的最低价格
      // 如果没有提供日期，默认为今天入住，明天离店
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const checkInDate = check_in || check_in_date || today.toISOString().split('T')[0];
      const checkOutDate = check_out || check_out_date || tomorrow.toISOString().split('T')[0];
      
      if (roomTypes.length > 0) {
        // 获取每个房型在指定日期范围内的价格
        const roomTypePrices = await Promise.all(roomTypes.map(async (roomType) => {
          const prices = await RoomPrice.findAll({
            where: { 
              room_type_id: roomType.id,
              price_date: {
                [Op.gte]: checkInDate,
                [Op.lt]: checkOutDate
              }
            },
            attributes: ['price']
          });
          
          if (prices.length === 0) return null;
          
          // 计算该房型的平均价格
          const sum = prices.reduce((acc, curr) => acc + parseFloat(curr.price), 0);
          return sum / prices.length;
        }));
        
        // 过滤掉没有价格的房型
        const validPrices = roomTypePrices.filter(p => p !== null);
        
        if (validPrices.length > 0) {
          // 取所有房型平均价格中的最小值
          minPrice = Math.min(...validPrices);
        }
      }

      // 获取统计数据
      const [favoriteCount, bookingCount, reviewCount] = await Promise.all([
        Favorite.count({ where: { hotel_id: hotel.id } }),
        Booking.count({ where: { hotel_id: hotel.id } }),
        HotelReview.count({ where: { hotel_id: hotel.id } })
      ]);

      return {
        hotel_id: hotel.id,
        hotel_name_cn: hotel.hotel_name_cn,
        hotel_name_en: hotel.hotel_name_en,
        star_rating: hotel.star_rating,
        rating: hotel.rating || 0,
        nearby_info: hotel.nearby_info || '',
        main_image_url: mainImageUrl,
        tags: hotel.tags || [],
        location_info: hotel.location_info || {},
        favorite_count: favoriteCount,
        average_rating: hotel.rating || 0,
        booking_count: bookingCount,
        review_count: reviewCount,
        min_price: parseFloat(minPrice.toFixed(2)),
        facilities,
        services
      };
    }));

    const normalizeList = (value) => {
      if (!value) {
        return [];
      }
      if (Array.isArray(value)) {
        return value.map(v => String(v).trim()).filter(v => v !== '');
      }
      if (typeof value === 'string' && value.includes(',')) {
        return value.split(',').map(v => v.trim()).filter(v => v !== '');
      }
      if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            return parsed.map(v => String(v).trim()).filter(v => v !== '');
          }
        } catch (e) {
        }
      }
      return [String(value).trim()].filter(v => v !== '');
    };

    // 价格筛选 - 支持多种参数名和格式
    let minPriceValue = minPrice || min_price;
    let maxPriceValue = maxPrice || max_price;
    // max_min_price 参数：能接收的最高的酒店最低价筛选
    // 逻辑：酒店的 min_price 必须小于等于 max_min_price
    if (max_min_price) {
        maxPriceValue = max_min_price;
    }
    // 处理价格范围数组
    if (priceRange && Array.isArray(priceRange) && priceRange.length === 2) {
      minPriceValue = priceRange[0];
      maxPriceValue = priceRange[1];
    }
    // 处理前端传递的selectedFilterValue和currentFilterType参数
    if (selectedFilterValue && currentFilterType === 'price') {
      console.log('Adding price filter from selectedFilterValue:', selectedFilterValue);
      const priceValue = selectedFilterValue;
      if (priceValue === '0-500') {
        minPriceValue = 0;
        maxPriceValue = 500;
      } else if (priceValue === '500-1000') {
        minPriceValue = 500;
        maxPriceValue = 1000;
      } else if (priceValue === '1000-1500') {
        minPriceValue = 1000;
        maxPriceValue = 1500;
      } else if (priceValue === '1500-2000') {
        minPriceValue = 1500;
        maxPriceValue = 2000;
      } else if (priceValue === '2000+') {
        minPriceValue = 2000;
        maxPriceValue = 5000;
      }
    }
    if (minPriceValue || maxPriceValue) {
      console.log('Applying price filter:', { minPriceValue, maxPriceValue });
      formattedHotels = formattedHotels.filter(hotel => {
        if (minPriceValue && hotel.min_price < minPriceValue) {
          return false;
        }
        if (maxPriceValue && hotel.min_price > maxPriceValue) {
          return false;
        }
        return true;
      });
      console.log('Hotels after price filter:', formattedHotels.length);
    }

    // 设施筛选 - 支持多种参数名
    const facilitiesFilter = facilities || amenities || selectedFacilities;
    if (facilitiesFilter) {
      console.log('Applying facilities filter:', facilitiesFilter);
      const facilityList = normalizeList(facilitiesFilter);
      
      if (facilityList.length > 0) {
          formattedHotels = formattedHotels.filter(hotel => {
            const facilityNames = (hotel.facilities || []).map(f => String(f.name));
            const facilityIds = (hotel.facilities || []).map(f => String(f.id));
            const tagNames = Array.isArray(hotel.tags) ? hotel.tags.map(t => String(t)) : [];
            return facilityList.every(facility => facilityNames.includes(facility) || facilityIds.includes(facility) || tagNames.includes(facility));
          });
          console.log('Hotels after facilities filter:', formattedHotels.length);
      }
    }

    // 服务筛选
    if (services) {
        console.log('Applying services filter:', services);
        const serviceList = normalizeList(services);

        if (serviceList.length > 0) {
            formattedHotels = formattedHotels.filter(hotel => {
                const serviceNames = (hotel.services || []).map(s => String(s.name));
                const serviceIds = (hotel.services || []).map(s => String(s.id));
                const tagNames = Array.isArray(hotel.tags) ? hotel.tags.map(t => String(t)) : [];
                return serviceList.every(service => serviceNames.includes(service) || serviceIds.includes(service) || tagNames.includes(service));
            });
            console.log('Hotels after services filter:', formattedHotels.length);
        }
    }

    // 标签筛选 - 支持前端传递的selectedTags参数
    const tagsFilter = tags || selectedTags;
    if (tagsFilter) {
      console.log('Applying tags filter:', tagsFilter);
      let tagList = [];
      if (Array.isArray(tagsFilter)) {
          tagList = tagsFilter;
      } else if (typeof tagsFilter === 'string' && tagsFilter.includes(',')) {
          tagList = tagsFilter.split(',').map(t => t.trim()).filter(t => t !== '');
      } else if (typeof tagsFilter === 'string' && tagsFilter.startsWith('[') && tagsFilter.endsWith(']')) {
          try {
              tagList = JSON.parse(tagsFilter);
          } catch (e) {
              tagList = [tagsFilter];
          }
      } else {
          tagList = [tagsFilter];
      }

      if (tagList.length > 0) {
          formattedHotels = formattedHotels.filter(hotel => {
            if (!hotel.tags || !Array.isArray(hotel.tags)) {
              return false;
            }
            // 标签筛选通常也是 AND 逻辑，或者 OR 逻辑，视业务需求而定
            // 文档未明确，通常多个标签筛选意味着“同时满足”
            return tagList.every(tag => hotel.tags.includes(tag));
          });
          console.log('Hotels after tags filter:', formattedHotels.length);
      }
    }

    // 距离排序（如果需要）
    if (sortParam === 'distance') {
      formattedHotels.sort((a, b) => a.distance - b.distance);
    }

    console.log('Formatted hotels:', formattedHotels.length);

    // 重新计算总数，因为我们可能在后端进行了额外的筛选
    const filteredTotal = formattedHotels.length;

    const result = {
      list: formattedHotels,
      total: filteredTotal,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      // 添加筛选条件到返回结果，以便前端显示
      filters: {
        city: cityFilter,
        check_in: check_in || check_in_date,
        check_out: check_out || check_out_date,
        star_rating: starFilter,
        min_price: minPriceValue,
        max_price: maxPriceValue,
        facilities: facilitiesFilter,
        services: services,
        tags: tagsFilter,
        keyword: keywordFilter,
        sort: sortParam,
        selectedTags: selectedTags,
        selectedFacilities: selectedFacilities,
        selectedFilterValue: selectedFilterValue,
        currentFilterType: currentFilterType
      }
    };

    console.log('Returning result:', result);
    console.log('=== End getHotelListService ===');

    return result;
  } catch (error) {
    console.error('=== Get hotel list error ===', error);
    // 抛出更友好的错误
    const friendlyError = new Error('获取酒店列表失败');
    friendlyError.code = 500;
    friendlyError.httpStatus = 500;
    throw friendlyError;
  }
};

const getHotelTagsService = async (city) => {
  if (!city) {
    const error = new Error('参数缺失（未提供城市名称）');
    error.code = 4009;
    error.httpStatus = 400;
    throw error;
  }

  // 查询指定城市的所有酒店
  const hotels = await Hotel.findAll({
    where: {
      status: 'published',
      [Op.or]: [
        where(literal(`"Hotel"."location_info"->>'city'`), city),
        where(literal(`"Hotel"."location_info"->>'formatted_address'`), { [Op.iLike]: `%${city}%` })
      ]
    },
    attributes: ['tags', 'nearby_info']
  });

  // 提取并去重标签
  const allTags = new Set();
  const allNearbyInfo = new Set();

  hotels.forEach(hotel => {
    // 处理标签
    if (hotel.tags && Array.isArray(hotel.tags)) {
      hotel.tags.forEach(tag => {
        if (tag) allTags.add(tag);
      });
    }

    // 处理周边信息
    if (hotel.nearby_info) {
      allNearbyInfo.add(hotel.nearby_info);
    }
  });

  // 限制数量并转换为数组
  const tagsList = Array.from(allTags).slice(0, 10);
  const nearbyInfoList = Array.from(allNearbyInfo).slice(0, 10);

  return {
    tags: tagsList,
    nearby_info: nearbyInfoList
  };
};

module.exports = {
  searchHotelsService,
  getHotelDetailService,
  getHotelImagesService,
  getHotelAvailabilityService,
  calculatePriceService,
  getRoomTypesService,
  getRoomTypeDetailService,
  getHotelListService,
  getHotelTagsService
};
