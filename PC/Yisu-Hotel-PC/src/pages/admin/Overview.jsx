import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Audits from './Audits';
import Listings from './Listings';
import Settings from '../merchant/Settings';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=200&auto=format&fit=facearea&facepad=2&h=200';

const getStoredUser = () => {
  const stored = localStorage.getItem('user');
  if (!stored) {
    return null;
  }
  try {
    return JSON.parse(stored);
  } catch (error) {
    return null;
  }
};

const getRolePath = (role) => {
  if (role === 'admin') {
    return '/admin';
  }
  return '/merchant';
};

export default function Overview() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = useMemo(() => getStoredUser(), []);
  const activeTab = searchParams.get('tab') || 'listings';

  useEffect(() => {
    document.title = '管理员控制台 | 易宿';
    document.documentElement.classList.add('light');
    return () => {
      document.documentElement.classList.remove('light');
    };
  }, []);

  useEffect(() => {
    if (!token || !user?.role) {
      navigate('/login', { replace: true });
      return;
    }
    if (user.role !== 'admin') {
      navigate(getRolePath(user.role), { replace: true });
    }
  }, [token, user, navigate]);

  const menuItems = [
    { key: 'listings', label: '酒店列表' },
    { key: 'audits', label: '审核记录' },
    { key: 'settings', label: '设置中心' }
  ];

  const profileValue = (value) => value || '--';

  const handleMenuClick = (key) => {
    setSearchParams({ tab: key });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsMenuOpen(false);
    navigate('/login', { replace: true });
  };

  const avatarUrl = user?.profile?.avatar_base64 || user?.profile?.avatar || DEFAULT_AVATAR;

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-white font-bold">易宿</div>
          <h1 className="text-xl font-bold tracking-tight">管理后台</h1>
        </div>
        <nav className="flex-1 mt-4">
          {menuItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleMenuClick(item.key)}
                className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary border-r-4 border-primary'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
                }`}
              >
                <span className="inline-flex h-2 w-2 rounded-full bg-current opacity-70" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">管理员概览</h2>
            <p className="text-sm text-slate-500">欢迎您！</p>
          </div>
          <div className="flex items-center gap-4 relative">
            <div className="text-right mr-2 hidden sm:block">
              <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">{profileValue(user?.account)}</p>
              <p className="text-xs text-slate-500">{profileValue(user?.role)}</p>
              <p className="text-xs text-slate-400">{profileValue(user?.profile?.nickname)}</p>
            </div>
            <button
              className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-primary/20"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <img
                src={avatarUrl}
                alt="头像"
                className="w-full h-full object-cover"
                onError={(event) => {
                  if (event.currentTarget.dataset.fallbackApplied) {
                    return;
                  }
                  event.currentTarget.dataset.fallbackApplied = 'true';
                  event.currentTarget.src = DEFAULT_AVATAR;
                }}
              />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-12 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg overflow-hidden">
                <div className="px-4 py-3 text-sm text-slate-500">用户菜单</div>
                <button
                  className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={handleLogout}
                >
                  退出登录
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {activeTab === 'listings' && <Listings />}
          {activeTab === 'audits' && <Audits />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </main>
    </div>
  );
}
