const { Op, where, literal } = require('sequelize');
const { Hotel, RoomType, HotelFacility, HotelService, HotelPolicy, Facility, Service, RoomTag, RoomFacility, RoomService, RoomPolicy, RoomPrice, HotelReview, Favorite, Booking } = require('../../models');

/**
 * 获取酒店工具定义
 */
exports.getToolDefinition = () => {
  return {
    type: 'function',
    function: {
      name: 'hotel_search',
      description: '搜索和获取酒店相关信息',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            description: '操作类型：search（搜索酒店）、detail（获取酒店详情）、compare（比较酒店）',
            enum: ['search', 'detail', 'compare']
          },
          keyword: {
            type: 'string',
            description: '搜索关键词（如城市名称、酒店名称、位置、标签等）'
          },
          hotel_id: {
            type: 'string',
            description: '酒店ID，用于获取详情或比较'
          },
          hotel_name: {
            type: 'string',
            description: '酒店名称，用于搜索具体酒店'
          },
          hotel_ids: {
            type: 'array',
            description: '酒店ID数组，用于比较多个酒店',
            items: {
              type: 'string'
            }
          }
        },
        required: []
      }
    }
  };
};

/**
 * 执行酒店工具调用
 */
exports.executeToolCall = async (args) => {
  try {
    const { action = 'search', keyword, query, hotel_id, hotel_name, hotel_ids } = args;

    switch (action) {
      case 'search': {
        const effectiveKeyword = keyword || query || hotel_name;
        return await searchHotels(effectiveKeyword);
      }
      case 'detail':
        // 如果提供了酒店名称，先搜索酒店获取ID，再获取详情
        if (hotel_name) {
          const searchResult = await searchHotels(hotel_name);
          if (searchResult.success && searchResult.matches.length > 0) {
            const firstMatch = searchResult.matches[0];
            const foundHotelId = firstMatch?.hotel_id || firstMatch?.id;
            if (!foundHotelId) {
              return { success: false, error: '未找到指定酒店' };
            }
            return await getHotelDetail(foundHotelId);
          }
          return { success: false, error: '未找到指定酒店' };
        }
        return await getHotelDetail(hotel_id);
      case 'compare':
        return await compareHotels(hotel_ids);
      default:
        return { success: false, error: '无效的操作类型' };
    }
  } catch (error) {
    console.error('Hotel Tool Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 搜索酒店
 */
async function searchHotels(keyword) {
  try {
    if (!keyword || typeof keyword !== 'string') {
      return { success: false, error: '请提供搜索关键词' };
    }
    const hotels = await Hotel.findAll({
      where: {
        status: 'published',
        [Op.or]: [
          { hotel_name_cn: { [Op.iLike]: `%${keyword}%` } },
          { hotel_name_en: { [Op.iLike]: `%${keyword}%` } },
          { description: { [Op.iLike]: `%${keyword}%` } },
          where(literal(`"Hotel"."location_info"->>'formatted_address'`), { [Op.iLike]: `%${keyword}%` }),
          { nearby_info: { [Op.iLike]: `%${keyword}%` } },
          where(literal(`"Hotel"."tags"::text`), { [Op.iLike]: `%${keyword}%` })
        ]
      },
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'hotel_name_cn', 'hotel_name_en', 'star_rating', 'rating', 'nearby_info', 'main_image_url', 'tags', 'location_info']
    });

    return {
      success: true,
      context: `搜索到 ${hotels.length} 家酒店`,
      matches: hotels.map(hotel => ({
        hotel_id: hotel.id,
        hotel_name_cn: hotel.hotel_name_cn,
        hotel_name_en: hotel.hotel_name_en,
        star_rating: hotel.star_rating,
        rating: hotel.rating,
        nearby_info: hotel.nearby_info || '',
        main_image_url: hotel.main_image_url,
        tags: hotel.tags || [],
        location_info: hotel.location_info || {}
      }))
    };
  } catch (error) {
    console.error('Search Hotels Error:', error);
    return { success: false, error: '搜索酒店失败' };
  }
}

/**
 * 获取酒店详情
 */
async function getHotelDetail(hotel_id) {
  try {
    if (!hotel_id || hotel_id === 'undefined' || hotel_id === 'null') {
      return { success: false, error: '酒店id不能为空' };
    }
    const hotel = await Hotel.findOne({
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
      attributes: ['id', 'hotel_name_cn', 'hotel_name_en', 'star_rating', 'rating', 'location_info', 'description', 'phone', 'main_image_url', 'tags']
    });

    if (!hotel) {
      return { success: false, error: '酒店不存在' };
    }

    const [roomTypes, reviewCount, favoriteCount, bookingCount] = await Promise.all([
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

    const roomTypesWithPrices = await Promise.all(
      roomTypes.map(async (roomType) => {
        const roomPrices = await RoomPrice.findAll({
          where: { room_type_id: roomType.id },
          attributes: ['price_date', 'price']
        });

        const prices = roomPrices.map(rp => ({
          date: rp.price_date,
          price: rp.price
        }));

        if (prices.length === 0) {
          prices.push({
            date: new Date().toISOString().split('T')[0],
            price: 259.00
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
      success: true,
      context: `获取到酒店 ${hotel.hotel_name_cn} 的详细信息`,
      matches: [{
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
        facilities: hotel.hotelFacilities?.map(hf => ({
          id: hf.facility_id,
          name: hf.facility?.name || ''
        })) || [],
        services: hotel.hotelServices?.map(hs => ({
          id: hs.service_id,
          name: hs.service?.name || ''
        })) || [],
        policies: {
          cancellation: hotel.policy?.cancellation_policy || '入住前24小时免费取消',
          payment: hotel.policy?.payment_policy || '支持信用卡及移动支付',
          children: hotel.policy?.children_policy || '12岁以下免费入住',
          pets: hotel.policy?.pets_policy || '不可携带宠物'
        },
        room_types: roomTypesWithPrices
      }]
    };
  } catch (error) {
    console.error('Get Hotel Detail Error:', error);
    return { success: false, error: '获取酒店详情失败' };
  }
}

/**
 * 比较酒店
 */
async function compareHotels(hotel_ids) {
  try {
    if (!Array.isArray(hotel_ids) || hotel_ids.length === 0) {
      return { success: false, error: '请提供要比较的酒店ID' };
    }

    const hotels = await Hotel.findAll({
      where: { id: hotel_ids },
      attributes: ['id', 'hotel_name_cn', 'hotel_name_en', 'star_rating', 'rating', 'location_info', 'main_image_url']
    });

    return {
      success: true,
      context: `比较 ${hotels.length} 家酒店`,
      matches: hotels.map(hotel => ({
        id: hotel.id,
        name: hotel.hotel_name_cn,
        star: hotel.star_rating,
        rating: hotel.rating,
        location: hotel.location_info?.city || hotel.location_info?.formatted_address,
        image: hotel.main_image_url
      }))
    };
  } catch (error) {
    console.error('Compare Hotels Error:', error);
    return { success: false, error: '比较酒店失败' };
  }
}
