/**
 * 生成指定长度的数字验证码
 * @param {number} [length=6] - 验证码长度，默认为6
 * @returns {string} - 生成的数字验证码字符串
 */
const generateCode = (length = 6) => {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
};

module.exports = {
  generateCode
};
