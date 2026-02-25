import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import Dashboard from './Dashboard';
import Listings from './Listings';
import Audits from './Audits';
import Settings from './Settings';
import { fetchAllHotels, fetchMessages, fetchUserProfile } from '../../utils/api';
const PAGE_SIZE = 100;
const PREVIEW_COUNT = 4;
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=200&auto=format&fit=facearea&facepad=2&h=200';
const DEFAULT_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420"><rect width="640" height="420" fill="%23e2e8f0"/><path d="M180 280l90-110 90 110 60-70 110 130H180z" fill="%23cbd5f5"/><circle cx="420" cy="150" r="40" fill="%23cbd5f5"/></svg>';

const getToken = () => localStorage.getItem('token');

export default function Overview() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [messagePage, setMessagePage] = useState(1);
  const navigate = useNavigate();
  const token = getToken();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const view = searchParams.get('view') || '';

  useEffect(() => {
    document.title = '商户控制台 | 易宿';
    document.documentElement.classList.add('light');
    return () => {
      document.documentElement.classList.remove('light');
    };
  }, []);

  const { data: profile, isLoading: profileLoading, error: profileError } = useSWR(
    token ? ['profile', token] : null,
    () => fetchUserProfile(token)
  );

  const {
    data: allHotels,
    isLoading: allHotelsLoading,
    error: allHotelsError
  } = useSWR(
    token ? ['hotel-all', token] : null,
    () => fetchAllHotels({ token, pageSize: PAGE_SIZE })
  );

  const {
    data: messagesData,
    isLoading: messagesLoading,
    error: messagesError,
    mutate: refreshMessages
  } = useSWR(
    token && isNotificationsOpen ? ['messages', token, messagePage] : null,
    () => fetchMessages({ token, page: messagePage }),
    { revalidateOnFocus: false }
  );

  const stats = useMemo(() => {
    if (!allHotels || !allHotels.list) {
      return {
        totalFavorites: 0,
        totalBookings: 0,
        totalHotels: 0,
        publishedHotels: 0
      };
    }
    const totalFavorites = allHotels.list.reduce((sum, item) => sum + (Number(item.favorite_count) || 0), 0);
    const totalBookings = allHotels.list.reduce((sum, item) => sum + (Number(item.booking_count) || 0), 0);
    const publishedHotels = allHotels.list.filter((item) => item.status === 'published').length;
    return {
      totalFavorites,
      totalBookings,
      totalHotels: allHotels.total || 0,
      publishedHotels
    };
  }, [allHotels]);

  const menuItems = [
    { key: 'dashboard', label: '控制面板' },
    { key: 'listings', label: '酒店列表' },
    { key: 'audits', label: '审核记录' },
    { key: 'settings', label: '设置中心' }
  ];

  const profileValue = (value) => {
    if (profileLoading) {
      return null;
    }
    if (profileError) {
      return '--';
    }
    return value || '--';
  };

  const handleMenuClick = (key) => {
    setSearchParams({ tab: key });
  };

  const handleViewAll = () => {
    setSearchParams({ tab: 'dashboard', view: 'properties' });
  };

  const handleBackToOverview = () => {
    setSearchParams({ tab: 'dashboard' });
  };

  const handleImageError = (event) => {
    if (event.currentTarget.dataset.fallbackApplied) {
      return;
    }
    event.currentTarget.dataset.fallbackApplied = 'true';
    event.currentTarget.src = DEFAULT_IMAGE;
  };

  const avatarUrl = profile?.avatar_base64 || profile?.avatar || DEFAULT_AVATAR;

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsMenuOpen(false);
    navigate('/login', { replace: true });
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev);
    setMessagePage(1);
  };

  const totalMessagePages = messagesData?.total_pages || 1;
  const messages = messagesData?.list || [];

  const previewHotels = useMemo(() => {
    if (!allHotels || !allHotels.list) {
      return [];
    }
    return allHotels.list.slice(0, PREVIEW_COUNT);
  }, [allHotels]);

  const isDashboard = activeTab === 'dashboard';
  const isViewAll = isDashboard && view === 'properties';

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-white font-bold">易宿</div>
          <h1 className="text-xl font-bold tracking-tight">商户平台</h1>
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
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 relative">
          <button
            className="w-full rounded-lg px-4 py-3 flex items-center gap-3 text-slate-500 hover:text-primary hover:bg-slate-50 transition-colors"
            onClick={toggleNotifications}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <svg className="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none">
                <path d="M12 3a6 6 0 0 1 6 6v3.5l1.6 2.7a1 1 0 0 1-.86 1.5H5.26a1 1 0 0 1-.86-1.5L6 12.5V9a6 6 0 0 1 6-6Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9.5 19a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </span>
            <span className="font-semibold">消息通知</span>
          </button>
          {isNotificationsOpen && (
            <div className="absolute left-0 right-0 bottom-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg max-h-[40rem] min-h-[28rem] flex flex-col overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0 bg-white dark:bg-slate-900">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">消息通知</span>
                <button
                  type="button"
                  className="text-xs font-semibold text-slate-500 hover:text-primary"
                  onClick={() => refreshMessages()}
                  disabled={messagesLoading}
                >
                  刷新
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                {messagesLoading && <div className="text-xs text-slate-500">正在加载消息...</div>}
                {!messagesLoading && messagesError && (
                  <div className="text-xs text-rose-500">{messagesError.message || '加载失败'}</div>
                )}
                {!messagesLoading && !messagesError && messages.length === 0 && (
                  <div className="text-xs text-slate-500">暂无消息</div>
                )}
                {!messagesLoading && !messagesError && messages.length > 0 && (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div key={msg.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>{msg.sender || '系统'}</span>
                          <span>{msg.created_at ? new Date(msg.created_at).toLocaleString('zh-CN', { hour12: false }) : '--'}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {msg.content?.hotel_name || '--'}（{msg.content?.status || '--'}）
                          </div>
                          <span className={`text-xs font-semibold ${msg.status === '已读' ? 'text-slate-400' : 'text-primary'}`}>
                            {msg.status || '--'}
                          </span>
                        </div>
                        {msg.content?.reject_reason && (
                          <div className="mt-2 text-xs text-rose-500">原因：{msg.content.reject_reason}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 flex-shrink-0 bg-slate-50 dark:bg-slate-800/50">
                <span>第 {messagesData?.page || messagePage} / {totalMessagePages} 页</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-50"
                    disabled={messagePage === 1}
                    onClick={() => setMessagePage((page) => Math.max(1, page - 1))}
                  >
                    上一页
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-50"
                    disabled={messagePage === totalMessagePages}
                    onClick={() => setMessagePage((page) => Math.min(totalMessagePages, page + 1))}
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 relative z-30">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">商户概览</h2>
            <p className="text-sm text-slate-500">欢迎您！</p>
          </div>
          <div className="flex items-center gap-4 relative">
            <div className="text-right mr-2 hidden sm:block">
              {profileLoading ? (
                <div className="space-y-2">
                  <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  <div className="h-2 w-20 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                </div>
              ) : (
                <>
                  <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">{profileValue(profile?.account)}</p>
                  <p className="text-xs text-slate-500">{profileValue(profile?.role)}</p>
                  <p className="text-xs text-slate-400">{profileValue(profile?.nickname)}</p>
                </>
              )}
            </div>
            <button
              className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-primary/20"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <img
                src={avatarUrl}
                alt="Profile"
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
              <div className="absolute right-0 top-12 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg overflow-hidden z-50">
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
          {activeTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              previewHotels={previewHotels}
              allHotels={allHotels?.list || []}
              loading={allHotelsLoading}
              error={allHotelsError}
              isViewAll={isViewAll}
              onViewAll={handleViewAll}
              onBack={handleBackToOverview}
              onImageError={handleImageError}
            />
          )}
          {activeTab === 'listings' && <Listings />}
          {activeTab === 'audits' && <Audits />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </main>
    </div>
  );
}
