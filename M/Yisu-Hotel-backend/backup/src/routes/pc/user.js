const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../../controllers/pc/user');
const { getUserMessages } = require('../../controllers/pc/message');
const { authenticateToken, validateUpdateProfile, validateMessageListQuery } = require('../../middlewares/pc/user');

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, validateUpdateProfile, updateProfile);
router.get('/messages', authenticateToken, validateMessageListQuery, getUserMessages);

module.exports = router;
