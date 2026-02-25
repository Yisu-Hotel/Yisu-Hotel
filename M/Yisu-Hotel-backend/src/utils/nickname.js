/**
 * 生成随机昵称
 * @param {string} role - 用户角色
 * @returns {string} - 生成的昵称字符串
 */
const generateNickname = (role) => {
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `${role}${randomNum}`;
};

module.exports = {
  generateNickname
};
