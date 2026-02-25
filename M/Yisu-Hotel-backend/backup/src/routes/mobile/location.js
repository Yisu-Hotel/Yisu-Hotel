const express = require('express');
const router = express.Router();
const locationController = require('../../controllers/mobile/location');

// 获取用户当前位置
router.get('/current', locationController.getCurrentLocation);

// 根据IP获取用户位置
router.get('/ip', locationController.getLocationByIP);

// 搜索附近的酒店
router.get('/nearby-hotels', locationController.searchNearbyHotels);

module.exports = router;