import React, { useEffect, useMemo, useState } from 'react';
import { mutate } from 'swr';
import { fetchUserProfile, updateUserProfile } from '../../utils/api';
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=200&auto=format&fit=facearea&facepad=2&h=200';
const MIN_BIRTHDAY = '1900-01-01';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('保密');
  const [birthday, setBirthday] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(DEFAULT_AVATAR);
  const [toast, setToast] = useState({ type: 'success', message: '', visible: false });

  const maxBirthday = useMemo(() => new Date().toISOString().split('T')[0], []);
  const trimmedNickname = nickname.trim();
  const nicknameError = trimmedNickname.length === 0 ? '昵称不能为空' : trimmedNickname.length > 20 ? '昵称不能超过20个字符' : '';
  const canSubmit = !profileLoading && !loading && !nicknameError;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setProfileLoading(false);
      return;
    }
    let isActive = true;
    fetchUserProfile(token)
      .then((data) => {
        if (!isActive) {
          return;
        }
        const initialNickname = data.nickname || '';
        const initialGender = data.gender || '保密';
        const initialBirthday = data.birthday || '';
        const initialAvatar = data.avatar || '';
        const initialAvatarBase64 = data.avatar_base64 || '';
        setNickname(initialNickname);
        setGender(initialGender);
        setBirthday(initialBirthday);
        setAvatar(initialAvatar);
        setAvatarBase64(initialAvatarBase64);
        setAvatarPreview(initialAvatarBase64 || initialAvatar || DEFAULT_AVATAR);
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }
        setToast({ type: 'error', message: error.message || '加载失败', visible: true });
      })
      .finally(() => {
        if (isActive) {
          setProfileLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!toast.visible) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.visible]);

  const handleAvatarChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarBase64(reader.result);
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setToast({ type: 'error', message: '请先登录', visible: true });
      return;
    }
    setLoading(true);
    const payload = {
      nickname: trimmedNickname,
      gender: gender || '保密',
      birthday: birthday || null,
      avatar: avatar || null,
      avatar_base64: avatarBase64 || null
    };

    try {
      await updateUserProfile({ token, payload });
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try {
          const parsedUser = JSON.parse(cachedUser);
          const nextUser = {
            ...parsedUser,
            profile: {
              ...(parsedUser.profile || {}),
              nickname: payload.nickname,
              gender: payload.gender,
              birthday: payload.birthday,
              avatar: payload.avatar,
              avatar_base64: payload.avatar_base64
            }
          };
          localStorage.setItem('user', JSON.stringify(nextUser));
        } catch (error) {
          localStorage.setItem('user', cachedUser);
        }
      }
      setToast({ type: 'success', message: '修改成功', visible: true });
      mutate(['profile', token]);
    } catch (error) {
      setToast({ type: 'error', message: error.message || '修改失败', visible: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast.visible && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div
            className={`rounded-lg border px-4 py-2 text-sm font-semibold shadow-lg ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                : 'bg-rose-50 border-rose-200 text-rose-600'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">用户信息编辑</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">更新头像、昵称与基础信息。</p>
        </div>
        <form className="p-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 ring-2 ring-primary/20">
              <img
                src={avatarPreview}
                alt="Avatar"
                className="h-full w-full object-cover"
                onError={(event) => {
                  if (event.currentTarget.dataset.fallbackApplied) {
                    return;
                  }
                  event.currentTarget.dataset.fallbackApplied = 'true';
                  event.currentTarget.src = DEFAULT_AVATAR;
                }}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">头像</label>
              <input
                className="mt-2 block text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="nickname">
              昵称
            </label>
            <input
              id="nickname"
              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${
                nicknameError ? 'border-rose-300' : 'border-slate-200 dark:border-slate-700'
              }`}
              value={nickname}
              maxLength={20}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="请输入昵称"
            />
            {nicknameError && <p className="text-xs text-rose-500">{nicknameError}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="gender">
                性别
              </label>
              <select
                id="gender"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={gender}
                onChange={(event) => setGender(event.target.value)}
              >
                <option value="男">男</option>
                <option value="女">女</option>
                <option value="保密">保密</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="birthday">
                生日
              </label>
              <input
                id="birthday"
                type="date"
                min={MIN_BIRTHDAY}
                max={maxBirthday}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={birthday}
                onChange={(event) => setBirthday(event.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className={`px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition-all ${
                canSubmit
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
              disabled={!canSubmit}
            >
              {loading ? '保存中...' : '保存修改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
