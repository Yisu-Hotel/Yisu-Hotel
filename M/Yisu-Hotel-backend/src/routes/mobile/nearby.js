const express = require('express');
const router = express.Router();
const nearbyController = require('../../controllers/mobile/nearby');

// 获取酒店周边信息
router.get('/hotel/:hotel_id', nearbyController.getHotelNearbyInfo);

// 获取酒店周边景点
router.get('/hotel/:hotel_id/attractions', nearbyController.getNearbyAttractions);

// 获取酒店周边设施
router.get('/hotel/:hotel_id/facilities', nearbyController.getNearbyFacilities);

module.exports = router;