const express = require('express');
const router = express.Router();
const homeController = require('../../controllers/mobile/home');

// 获取首页推荐酒店列表
router.get('/recommended-hotels', homeController.getRecommendedHotels);

// 获取首页热门活动列表
router.get('/hot-activities', homeController.getHotActivities);

// 获取首页综合数据
router.get('/data', homeController.getHomeData);

module.exports = router;