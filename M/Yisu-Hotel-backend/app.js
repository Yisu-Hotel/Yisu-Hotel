require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/pc/auth');
const mobileAuthRoutes = require('./src/routes/mobile/auth');
const userRoutes = require('./src/routes/pc/user');
const hotelRoutes = require('./src/routes/pc/hotel');
const adminRoutes = require('./src/routes/pc/admin');

// 移动端其他路由
const mobileBannerRoutes = require('./src/routes/mobile/banner');
const mobileCityRoutes = require('./src/routes/mobile/city');
const mobileHomeRoutes = require('./src/routes/mobile/home');
const mobileHotelRoutes = require('./src/routes/mobile/hotel');
const mobileBookingRoutes = require('./src/routes/mobile/booking');
const mobileUserRoutes = require('./src/routes/mobile/user');
const mobileFavoriteRoutes = require('./src/routes/mobile/favorite');
const mobileReviewRoutes = require('./src/routes/mobile/review');
const mobilePaymentRoutes = require('./src/routes/mobile/payment');
const mobilePromotionRoutes = require('./src/routes/mobile/promotion');
const mobileLocationRoutes = require('./src/routes/mobile/location');
const mobileNearbyRoutes = require('./src/routes/mobile/nearby');
const mobileCouponRoutes = require('./src/routes/mobile/coupon');
const mobileHistoryRoutes = require('./src/routes/mobile/history');
const mobileChatRoutes = require('./src/routes/mobile/chat');
const mobileHelpRoutes = require('./src/routes/mobile/help');

const app = express();

app.use(cors());

// 自定义JSON解析中间件，处理格式不正确的请求体
app.use((req, res, next) => {
  if (req.headers['content-type'] === 'application/json') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        // 检查body是否为空
        if (!body || body.trim() === '') {
          req.body = {};
          next();
        } else {
          req.body = JSON.parse(body);
          next();
        }
      } catch (error) {
        console.error('JSON解析错误:', error);
        // 即使JSON解析错误，也继续处理请求，设置空的请求体
        req.body = {};
        next();
      }
    });
  } else {
    // 对于非JSON请求，使用默认的解析器
    express.json({ limit: '100mb' })(req, res, () => {
      express.urlencoded({ extended: true, limit: '10mb' })(req, res, next);
    });
  }
});

app.get('/api/status', (req, res) => {
  res.json({ code: 200, msg: 'Express后端服务启动成功！', data: null });
});

app.get('/api/test', (req, res) => {
  res.json({
    code: 200,
    msg: '前后端连通性测试成功',
    data: {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path
    }
  });
});

const PORT = process.env.PORT || 3001;

app.use('/auth', authRoutes);
app.use('/mobile/auth', mobileAuthRoutes);
app.use('/user', userRoutes);
app.use('/hotel', hotelRoutes);
app.use('/admin', adminRoutes);

// 移动端其他路由
app.use('/mobile/banner', mobileBannerRoutes);
app.use('/mobile/city', mobileCityRoutes);
app.use('/mobile/home', mobileHomeRoutes);
app.use('/mobile/hotel', mobileHotelRoutes);
app.use('/mobile/booking', mobileBookingRoutes);
app.use('/mobile/user', mobileUserRoutes);
app.use('/mobile/favorite', mobileFavoriteRoutes);
app.use('/mobile/review', mobileReviewRoutes);
app.use('/mobile/payment', mobilePaymentRoutes);
app.use('/mobile/promotion', mobilePromotionRoutes);
app.use('/mobile/location', mobileLocationRoutes);
app.use('/mobile/nearby', mobileNearbyRoutes);
app.use('/mobile/coupon', mobileCouponRoutes);
app.use('/mobile/history', mobileHistoryRoutes);
app.use('/mobile/chat', mobileChatRoutes);
app.use('/mobile/help', mobileHelpRoutes);

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('全局错误:', err);
  res.status(500).json({
    code: 500,
    msg: '服务器内部错误',
    data: null
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Express服务运行在：http://localhost:${PORT}`);
  
  // 测试数据库连接
  const sequelize = require('./src/config/database');
  sequelize.authenticate()
    .then(() => {
      console.log('✅ 数据库连接成功！');
      
      // 启动优惠券定时任务
      const { startCouponTasks } = require('./src/tasks/coupon-tasks');
      startCouponTasks();
    })
    .catch((error) => {
      console.error('❌ 数据库连接失败:', error);
    });
});
