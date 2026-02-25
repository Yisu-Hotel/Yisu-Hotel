const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({
        code: 4008,
        msg: 'Token 无效或已过期',
        data: null
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        code: 4008,
        msg: 'Token 无效或已过期',
        data: null
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      user_id: decoded.user_id,
      phone: decoded.phone,
      role: decoded.role
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      code: 4008,
      msg: 'Token 无效或已过期',
      data: null
    });
  }
};
