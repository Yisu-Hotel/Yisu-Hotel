const { User, UserProfile } = require('../../models');

/**
 * 获取用户个人资料服务
 * @param {number} userId - 用户ID
 * @returns {Promise<Object>} - 用户资料
 */
const getProfileService = async (userId) => {
  const user = await User.findOne({
    where: { id: userId }
  });

  if (!user) {
    const error = new Error('用户不存在');
    error.code = 4008;
    error.httpStatus = 404;
    throw error;
  }

  const profile = await UserProfile.findOne({
    where: { user_id: userId }
  });

  const responseData = {
    id: user.id,
    account: user.phone,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at
  };

  if (profile) {
    if (profile.nickname) {
      responseData.nickname = profile.nickname;
    }
    if (profile.avatar) {
      responseData.avatar = profile.avatar;
    }
    if (profile.avatar_base64) {
      responseData.avatar_base64 = profile.avatar_base64;
    }
    if (profile.gender) {
      responseData.gender = profile.gender;
    }
    if (profile.birthday) {
      responseData.birthday = profile.birthday;
    }
  } else if (user.nickname) {
    responseData.nickname = user.nickname;
  }

  return responseData;
};

/**
 * 更新用户个人资料服务
 * @param {number} userId - 用户ID
 * @param {Object} updateData - 更新数据
 * @param {string} [updateData.nickname] - 昵称
 * @param {string} [updateData.gender] - 性别
 * @param {string} [updateData.birthday] - 生日
 * @param {string} [updateData.avatar] - 头像URL
 * @param {string} [updateData.avatar_base64] - 头像Base64
 * @returns {Promise<Object>} - 更新结果
 */
const updateProfileService = async (userId, updateData) => {
  const user = await User.findOne({
    where: { id: userId }
  });

  if (!user) {
    const error = new Error('用户不存在');
    error.code = 4008;
    error.httpStatus = 404;
    throw error;
  }

  const profileUpdateData = {};
  const { nickname, gender, birthday, avatar, avatar_base64 } = updateData;

  if (nickname !== undefined) {
    profileUpdateData.nickname = nickname === null ? null : nickname.trim();
  }
  if (gender !== undefined) {
    profileUpdateData.gender = gender === null ? null : gender;
  }
  if (birthday !== undefined) {
    profileUpdateData.birthday = birthday === null ? null : birthday;
  }
  if (avatar !== undefined) {
    profileUpdateData.avatar = avatar === null ? null : avatar.trim();
  }
  if (avatar_base64 !== undefined) {
    profileUpdateData.avatar_base64 = avatar_base64 === null ? null : avatar_base64.trim();
  }

  let profile = await UserProfile.findOne({
    where: { user_id: userId }
  });

  if (profile) {
    profile = await profile.update(profileUpdateData);
  } else {
    profile = await UserProfile.create({
      user_id: userId,
      ...profileUpdateData
    });
  }

  if (nickname !== undefined) {
    await user.update({
      nickname: profileUpdateData.nickname
    });
  }

  return {
    id: user.id,
    updated_at: profile.updated_at || user.updated_at
  };
};

module.exports = {
  getProfileService,
  updateProfileService
};
