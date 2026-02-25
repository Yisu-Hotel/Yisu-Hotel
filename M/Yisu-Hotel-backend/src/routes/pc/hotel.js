const express = require('express');
const router = express.Router();
const { createHotel, updateHotel, getHotelList, getHotelDetail, getHotelAuditStatus, deleteHotel } = require('../../controllers/pc/hotel');
const { authenticateToken } = require('../../middlewares/pc/user');
const { validateHotelListQuery, validateCreateHotelInput, validateHotelDetailParam, validateAuditStatusParam, validateHotelDeleteParam } = require('../../middlewares/pc/hotel');

router.post('/create', authenticateToken, validateCreateHotelInput, createHotel);
router.put('/update/:id', authenticateToken, validateHotelDetailParam, validateCreateHotelInput, updateHotel);
router.get('/list', authenticateToken, validateHotelListQuery, getHotelList);
router.get('/detail/:id', authenticateToken, validateHotelDetailParam, getHotelDetail);
router.get('/audit-status/:id', authenticateToken, validateAuditStatusParam, getHotelAuditStatus);
router.delete('/delete/:id', authenticateToken, validateHotelDeleteParam, deleteHotel);

module.exports = router;
