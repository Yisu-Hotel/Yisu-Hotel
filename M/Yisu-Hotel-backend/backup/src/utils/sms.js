require('dotenv').config();

const Dypnsapi20170525 = require('@alicloud/dypnsapi20170525');
const OpenApi = require('@alicloud/openapi-client');
const Util = require('@alicloud/tea-util');
const Credential = require('@alicloud/credentials');

/**
 * 阿里云短信服务工具类
 */
class AliyunSMS {
  /**
   * 创建阿里云短信客户端
   * @returns {Dypnsapi20170525.default} - 短信客户端实例
   */
  static createClient() {
    const credential = new Credential.default({
      type: 'access_key',
      accessKeyId: process.env.accessKeyId,
      accessKeySecret: process.env.accessKeySecret
    });

    const config = new OpenApi.Config({
      credential: credential,
    });

    config.endpoint = 'dypnsapi.aliyuncs.com';
    return new Dypnsapi20170525.default(config);
  }

  /**
   * 发送验证码短信
   * @param {string} phoneNumber - 接收短信的手机号
   * @param {string} code - 验证码
   * @returns {Promise<Object>} - 发送结果
   * @throws {Error} - 发送失败抛出异常
   */
  static async sendVerifyCode(phoneNumber, code) {
    const client = this.createClient();
    const request = new Dypnsapi20170525.SendSmsVerifyCodeRequest({
      signName: '速通互联验证码',
      templateCode: '100001',
      templateParam: JSON.stringify({ code: code, min: '5' }),
      phoneNumber: phoneNumber,
    });

    const runtime = new Util.RuntimeOptions({});

    try {
      const resp = await client.sendSmsVerifyCodeWithOptions(request, runtime);
      return resp.body;
    } catch (error) {
      console.error('短信发送失败:', error.message);
      throw error;
    }
  }
}

module.exports = AliyunSMS;
