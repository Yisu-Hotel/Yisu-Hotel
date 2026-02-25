const logger = require('../utils/logger');

// 监控指标
let requestCount = 0;
let errorCount = 0;
let totalResponseTime = 0;
let monitoringStats = {
  requestCount: 0,
  errorCount: 0,
  avgResponseTime: 0,
  lastReset: new Date()
};

// 监控中间件
const monitoringMiddleware = (req, res, next) => {
  const startTime = Date.now();
  requestCount++;
  monitoringStats.requestCount++;

  // 拦截响应结束事件
  const originalEnd = res.end;
  res.end = function(...args) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    totalResponseTime += responseTime;
    
    // 计算平均响应时间
    monitoringStats.avgResponseTime = totalResponseTime / monitoringStats.requestCount;

    // 记录响应时间
    logger.info(`请求处理完成`, {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: res.get('content-length')
    });

    // 检查是否为错误响应
    if (res.statusCode >= 400) {
      errorCount++;
      monitoringStats.errorCount++;
    }

    originalEnd.apply(this, args);
  };

  next();
};

// 获取监控统计信息
const getMonitoringStats = () => {
  return {
    ...monitoringStats,
    currentTime: new Date(),
    uptime: process.uptime()
  };
};

// 重置监控统计信息
const resetMonitoringStats = () => {
  monitoringStats = {
    requestCount: 0,
    errorCount: 0,
    avgResponseTime: 0,
    lastReset: new Date()
  };
  requestCount = 0;
  errorCount = 0;
  totalResponseTime = 0;
  return monitoringStats;
};

module.exports = {
  monitoringMiddleware,
  getMonitoringStats,
  resetMonitoringStats
};
