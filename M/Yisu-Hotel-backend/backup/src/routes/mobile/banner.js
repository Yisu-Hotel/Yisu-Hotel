const express = require('express');
const router = express.Router();
const bannerController = require('../../controllers/mobile/banner');

// 获取首页Banner列表
router.get('/list', bannerController.getBannerList);

module.exports = router;