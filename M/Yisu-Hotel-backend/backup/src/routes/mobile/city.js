const express = require('express');
const router = express.Router();
const cityController = require('../../controllers/mobile/city');

// 获取城市列表、热门城市、搜索城市统一接口
// type: list(默认) | hot | search
// keyword: 搜索关键词(仅type=search时需要)
// limit: 返回数量(默认10)
router.get('/list', cityController.getCities);

module.exports = router;
