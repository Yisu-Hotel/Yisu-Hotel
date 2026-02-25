const { Op, where, literal } = require('sequelize');
const { Hotel, HotelFacility, HotelService, HotelPolicy, RoomType, RoomPrice, HotelReview, Facility, Service } = require('../../models');

const searchHotelsService = async (params) => {
  const { city, check_in, check_out, guests, min_price, max_price, star_rating, facilities, sort_by, page = 1, size = 20 } = params;

  const whereClause = {
    status: 'published'
  };

  // 添加城市筛选
  if (city) {
    whereClause[Op.or] = [
      where(literal(`"Hotel"."location_info"->>'city'`), city),
      where(literal(`"Hotel"."location_info"->>'formatted_address'`), { [Op.iLike]: `%${city}%` })
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

const getHotelDetailService = async (hotel_id) => {
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
  const [hotel, roomTypes] = await Promise.all([
    Hotel.findOne(queryOptions),
    RoomType.findAll({
      where: { hotel_id },
      attributes: ['id', 'room_type_name', 'bed_type', 'area', 'description']
    })
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
        room_type_name: roomType.room_type_name,
        bed_type: roomType.bed_type,
        area: roomType.area,
        description: roomType.description,
        room_image_url: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20room%20interior%20${roomType.id}%20default%20placeholder&image_size=landscape_4_3`, // 默认占位图片
        tags: ['推荐', '高楼层', '景观房'], // 模拟数据
        facilities: [], // 模拟数据
        services: [], // 模拟数据
        policies: {
          cancellation: '不可取消',
          payment: '在线支付',
          children: '不允许携带儿童',
          pets: '不允许携带宠物'
        },
        prices
      };
    })
  );

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
    review_count: Math.floor(Math.random() * 1000), // 模拟数据
    description: hotel.description,
    phone: hotel.phone || '',
    opening_date: hotel.opening_date || '',
    nearby_info: hotel.nearby_info || '',
    main_image_url: mainImageUrl,
    tags: hotel.tags || [],
    location_info: hotel.location_info || {},
    favorite_count: Math.floor(Math.random() * 1000), // 模拟数据
    booking_count: Math.floor(Math.random() * 5000), // 模拟数据
    facilities,
    services,
    policies,
    room_types: roomTypesWithPrices
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
    attributes: ['id', 'room_type_name', 'description', 'bed_type', 'area', 'max_guests', 'base_price', 'main_image_url']
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
    facilities: [
      { id: 1, name: '免费WiFi' },
      { id: 2, name: '空调' },
      { id: 3, name: '电视' },
      { id: 4, name: '独立卫浴' }
    ],
    services: [
      { id: 1, name: '24小时热水' },
      { id: 2, name: '洗漱用品' }
    ],
    policies: [
      { id: 1, type: 'check_in', value: '14:00后' },
      { id: 2, type: 'check_out', value: '12:00前' }
    ]
  }));

  return formattedRoomTypes;
};

const getRoomTypeDetailService = async (hotel_id, room_type_id, check_in, check_out) => {
  // 从数据库获取房型详情
  const roomType = await RoomType.findOne({
    where: { id: room_type_id, hotel_id },
    attributes: ['id', 'room_type_name', 'description', 'bed_type', 'area', 'max_guests', 'base_price', 'main_image_url']
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
    facilities: [
      { id: 1, name: '免费WiFi' },
      { id: 2, name: '空调' },
      { id: 3, name: '电视' },
      { id: 4, name: '独立卫浴' },
      { id: 5, name: '书桌' },
      { id: 6, name: '衣柜' }
    ],
    services: [
      { id: 1, name: '24小时热水' },
      { id: 2, name: '洗漱用品' },
      { id: 3, name: '毛巾浴巾' },
      { id: 4, name: '拖鞋' }
    ],
    policies: [
      { id: 1, type: 'check_in', value: '14:00后' },
      { id: 2, type: 'check_out', value: '12:00前' },
      { id: 3, type: 'cancellation', value: '入住前24小时可免费取消' },
      { id: 4, type: 'smoking', value: '禁烟' }
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
    check_in_date,
    check_out_date,
    check_in, // 前端可能传递的参数名
    check_out, // 前端可能传递的参数名
    star_rating,
    minPrice,
    maxPrice,
    min_price, // 前端可能传递的参数名
    max_price, // 前端可能传递的参数名
    rating,
    minRating, // 前端传递的参数名
    facilities,
    services,
    tags,
    nearby_info,
    keyword,
    sort, // 前端传递的排序参数
    sort_by // 前端可能传递的参数名
  } = params;

    console.log('Parsed params:', {
      page,
      pageSize,
      location,
      city,
      check_in_date,
      check_out_date,
      check_in,
      check_out,
      star_rating,
      minPrice,
      maxPrice,
      min_price,
      max_price,
      rating,
      minRating,
      facilities,
      services,
      tags,
      nearby_info,
      keyword,
      sort,
      sort_by
    });

    // 构建查询条件
    const whereCondition = {
      status: 'published' // 只返回已发布的酒店
    };

    // 构建 OR 条件数组
    const orConditions = [];

    // 城市筛选
    const cityFilter = location || city;
    if (cityFilter) {
      console.log('Adding city filter:', cityFilter);
      orConditions.push(
        where(literal(`"Hotel"."location_info"->>'city'`), cityFilter),
        where(literal(`"Hotel"."location_info"->>'formatted_address'`), { [Op.iLike]: `%${cityFilter}%` })
      );
    }

    // 关键词搜索
    if (keyword) {
      console.log('Adding keyword filter:', keyword);
      orConditions.push(
        { hotel_name_cn: { [Op.iLike]: `%${keyword}%` } },
        { hotel_name_en: { [Op.iLike]: `%${keyword}%` } },
        { description: { [Op.iLike]: `%${keyword}%` } },
        where(literal(`"Hotel"."location_info"->>'formatted_address'`), { [Op.iLike]: `%${keyword}%` }),
        { nearby_info: { [Op.iLike]: `%${keyword}%` } }
      );
    }

    // 添加 OR 条件到查询条件
    if (orConditions.length > 0) {
      whereCondition[Op.or] = orConditions;
      console.log('Added OR conditions:', orConditions.length);
    }

    // 星级筛选
    if (star_rating) {
      console.log('Adding star rating filter:', star_rating);
      whereCondition.star_rating = star_rating;
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
    const sortParam = sort || sort_by;
    if (sortParam === 'rating') {
      orderCondition = [['rating', 'DESC']];
    } else if (sortParam === 'price_asc') {
      orderCondition = [[literal('min_price'), 'ASC']];
    } else if (sortParam === 'price_desc') {
      orderCondition = [[literal('min_price'), 'DESC']];
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

    // 格式化酒店数据
    let formattedHotels = await Promise.all(hotels.map(async (hotel) => {
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
        hotel_id: hotel.id,
        hotel_name_cn: hotel.hotel_name_cn,
        hotel_name_en: hotel.hotel_name_en,
        star_rating: hotel.star_rating,
        rating: hotel.rating || 0,
        nearby_info: hotel.nearby_info || '',
        main_image_url: mainImageUrl,
        tags: hotel.tags || [],
        location_info: hotel.location_info || {},
        favorite_count: Math.floor(Math.random() * 1000), // 模拟数据
        average_rating: hotel.rating || 0,
        booking_count: Math.floor(Math.random() * 5000), // 模拟数据
        review_count: Math.floor(Math.random() * 1000), // 模拟数据
        min_price: minPrice
      };
    }));

    // 价格筛选
    const minPriceValue = minPrice || min_price;
    const maxPriceValue = maxPrice || max_price;
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

    // 设施筛选
    if (facilities) {
      console.log('Applying facilities filter:', facilities);
      const facilityList = Array.isArray(facilities) ? facilities : [facilities];
      formattedHotels = formattedHotels.filter(hotel => {
        // 这里简化处理，实际应该根据hotel_facilities表进行筛选
        // 暂时返回所有酒店
        return true;
      });
    }

    // 标签筛选
    if (tags) {
      console.log('Applying tags filter:', tags);
      const tagList = Array.isArray(tags) ? tags : [tags];
      formattedHotels = formattedHotels.filter(hotel => {
        if (!hotel.tags || !Array.isArray(hotel.tags)) {
          return false;
        }
        return tagList.some(tag => hotel.tags.includes(tag));
      });
      console.log('Hotels after tags filter:', formattedHotels.length);
    }

    console.log('Formatted hotels:', formattedHotels.length);

    // 重新计算总数，因为我们可能在后端进行了额外的筛选
    const filteredTotal = formattedHotels.length;

    const result = {
      list: formattedHotels,
      total: filteredTotal,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
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