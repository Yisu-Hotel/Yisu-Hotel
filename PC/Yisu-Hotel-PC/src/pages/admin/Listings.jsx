import React, { useEffect, useMemo, useState } from 'react';
import { fetchAdminAuditList, fetchAdminHotelDetail, submitAdminHotelAudit } from '../../utils/api';

const tabs = [
  { key: 'online', label: '已上线列表' },
  { key: 'offline', label: '被下线列表' }
];

const STATUS_OPTIONS = [
  { value: 'pending', label: '待审核', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { value: 'auditing', label: '审核中', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'published', label: '已发布', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { value: 'rejected', label: '已拒绝', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' }
];

const formatLocation = (locationInfo = {}) => {
  const city = locationInfo.city || '';
  const district = locationInfo.district || '';
  const address = locationInfo.formatted_address || locationInfo.street || '';
  return { city, district, address };
};

const formatDateTime = (value) => {
  if (!value) {
    return '--';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('zh-CN', { hour12: false });
};

export default function Listings() {
  const [activeTab, setActiveTab] = useState('online');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hotels, setHotels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailData, setDetailData] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [offlineOpen, setOfflineOpen] = useState(false);
  const [offlineReason, setOfflineReason] = useState('');
  const [offlineHotel, setOfflineHotel] = useState(null);

  const handleViewDetails = (hotel) => {
    if (!hotel?.hotel_id) {
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setDetailError('请先登录');
      setDetailData(null);
      setDetailOpen(true);
      return;
    }
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError('');
    fetchAdminHotelDetail({ token, hotelId: hotel.hotel_id })
      .then((data) => {
        setDetailData(data || null);
      })
      .catch((fetchError) => {
        setDetailError(fetchError.message || '加载失败');
        setDetailData(null);
      })
      .finally(() => {
        setDetailLoading(false);
      });
  };

  const closeOfflineModal = () => {
    setOfflineOpen(false);
    setOfflineReason('');
    setOfflineHotel(null);
    setActionError('');
  };

  const submitStatusChange = async ({ hotelId, status, rejectReason }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setActionError('请先登录');
      return false;
    }
    setActionLoadingId(hotelId);
    setActionMessage('');
    setActionError('');
    try {
      await submitAdminHotelAudit({
        token,
        hotelIds: [hotelId],
        status,
        rejectReason: status === 'rejected' ? rejectReason : undefined
      });
      setActionMessage(status === 'published' ? '已重新上线' : '已下线');
      return true;
    } catch (requestError) {
      setActionError(requestError.message || '操作失败');
      return false;
    } finally {
      setActionLoadingId('');
    }
  };

  const handleTakeOffline = (hotel) => {
    setOfflineHotel(hotel);
    setOfflineReason('');
    setOfflineOpen(true);
  };

  const handleBringOnline = async (hotel) => {
    if (!hotel?.hotel_id) {
      return;
    }
    const success = await submitStatusChange({ hotelId: hotel.hotel_id, status: 'published' });
    if (success) {
      loadHotels();
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(hotels.length / pageSize)), [hotels, pageSize]);

  const pagedHotels = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return hotels.slice(start, start + pageSize);
  }, [hotels, currentPage, pageSize]);

  const loadHotels = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('请先登录');
      setHotels([]);
      return () => {};
    }

    const status = activeTab === 'online' ? 'published' : 'rejected';
    let isActive = true;
    setLoading(true);
    setError('');
    setActionMessage('');
    setActionError('');

    fetchAdminAuditList({ token, status, page: 1, pageSize: 50 })
      .then((data) => {
        if (!isActive) {
          return;
        }
        setHotels(Array.isArray(data?.list) ? data.list : []);
        setCurrentPage(1);
      })
      .catch((fetchError) => {
        if (!isActive) {
          return;
        }
        setError(fetchError.message || '加载失败');
        setHotels([]);
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  };

  useEffect(() => loadHotels(), [activeTab]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailError('');
    setDetailData(null);
  };

  const handleConfirmOffline = async () => {
    if (!offlineHotel?.hotel_id) {
      return;
    }
    const reason = offlineReason.trim();
    if (!reason) {
      setActionError('请输入下线原因');
      return;
    }
    const success = await submitStatusChange({
      hotelId: offlineHotel.hotel_id,
      status: 'rejected',
      rejectReason: reason
    });
    if (success) {
      closeOfflineModal();
      loadHotels();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">酒店上架管理</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">查看已上线与被下线的酒店列表。</p>
          </div>
          <div className="inline-flex rounded-full bg-slate-100 dark:bg-slate-800 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                  activeTab === tab.key
                    ? 'bg-white dark:bg-slate-900 text-primary shadow'
                    : 'text-slate-500 hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {actionMessage && (
            <div className="px-6 py-3 text-sm text-emerald-600 border-b border-slate-200 dark:border-slate-800">
              {actionMessage}
            </div>
          )}
          {actionError && (
            <div className="px-6 py-3 text-sm text-rose-500 border-b border-slate-200 dark:border-slate-800">
              {actionError}
            </div>
          )}
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <span className="material-symbols-outlined text-4xl mb-3 animate-spin">autorenew</span>
              <p className="text-sm">正在加载酒店列表...</p>
            </div>
          ) : error ? (
            <div className="p-12 flex flex-col items-center justify-center text-rose-500">
              <span className="material-symbols-outlined text-4xl mb-3">error</span>
              <p className="text-sm">{error}</p>
            </div>
          ) : pagedHotels.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <span className="material-symbols-outlined text-4xl mb-3">sentiment_dissatisfied</span>
              <p className="text-sm">暂无符合条件的酒店</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                    <th className="px-6 py-4">酒店信息</th>
                    <th className="px-6 py-4">地点</th>
                    <th className="px-6 py-4">状态</th>
                    <th className="px-6 py-4">提交信息</th>
                    <th className="px-6 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pagedHotels.map((hotel) => {
                    const statusConfig = STATUS_OPTIONS.find((item) => item.value === hotel.status);
                    const location = formatLocation(hotel.location_info);
                    const isActionLoading = actionLoadingId === hotel.hotel_id;
                    return (
                      <tr key={hotel.hotel_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{hotel.hotel_name_cn || '--'}</p>
                            <p className="text-xs text-slate-500">{hotel.hotel_name_en || '--'}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{hotel.hotel_id || '--'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm">
                          <p className="text-slate-700 dark:text-slate-300">{location.city || '--'} {location.district || ''}</p>
                          <p className="text-[10px] text-slate-500">{location.address || '--'}</p>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig?.color || 'bg-slate-100 text-slate-700'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                            {hotel.status_text || statusConfig?.label || '--'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                          <p>{formatDateTime(hotel.submitted_at)}</p>
                          <p className="text-[10px] text-slate-500">{hotel.submitted_by || '--'}</p>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-3 text-sm font-semibold">
                            <button onClick={() => handleViewDetails(hotel)} className="text-slate-500 hover:text-primary">查看详情</button>
                            {activeTab === 'online' ? (
                              <button
                                onClick={() => handleTakeOffline(hotel)}
                                className="text-slate-500 hover:text-rose-500 disabled:text-slate-300"
                                disabled={isActionLoading}
                              >
                                {isActionLoading ? '处理中...' : '下线'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBringOnline(hotel)}
                                className="text-slate-500 hover:text-emerald-500 disabled:text-slate-300"
                                disabled={isActionLoading}
                              >
                                {isActionLoading ? '处理中...' : '重新上线'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-xs text-slate-500">
              共 {hotels.length} 家酒店 | 第 {currentPage} / {totalPages} 页
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="px-3 py-1 text-xs font-semibold rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50"
              >
                上一页
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                className="px-3 py-1 text-xs font-semibold rounded border border-slate-200 dark:border-slate-700 disabled:opacity-50"
              >
                下一页
              </button>
              <select
                className="py-1 px-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setCurrentPage(1);
                }}
              >
                {[10, 20, 30, 50].map((size) => (
                  <option key={size} value={size}>
                    {size} / 页
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      {detailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={closeDetail}>
          <div
            className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">酒店详情</p>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {detailData?.hotel_name_cn || '酒店详情'}
                </h4>
                <p className="text-xs text-slate-400">{detailData?.hotel_name_en || '--'}</p>
              </div>
              <button type="button" className="text-sm font-semibold text-slate-500 hover:text-primary" onClick={closeDetail}>
                关闭
              </button>
            </div>

            {detailLoading && (
              <div className="mt-6 text-sm text-slate-500">正在加载酒店详情...</div>
            )}
            {!detailLoading && detailError && (
              <div className="mt-6 text-sm text-rose-500">{detailError}</div>
            )}
            {!detailLoading && !detailError && detailData && (
              <div className="mt-6 space-y-5 text-sm text-slate-600 dark:text-slate-300">
                <div>
                  <p className="text-xs text-slate-400">酒店ID</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{detailData.hotel_id || '--'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">星级</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{detailData.star_rating || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">电话</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{detailData.phone || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">开业时间</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{detailData.opening_date || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">状态</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{detailData.status || '--'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-slate-400">地址</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{detailData.location_info?.formatted_address || '--'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400">酒店描述</p>
                  <p className="mt-1 text-slate-700 dark:text-slate-200">{detailData.description || '--'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">周边信息</p>
                  <p className="mt-1 text-slate-700 dark:text-slate-200">{detailData.nearby_info || '--'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">酒店图片</p>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {detailData.main_image_base64 && Array.isArray(detailData.main_image_base64) && detailData.main_image_base64.length > 0
                      ? detailData.main_image_base64.map((src, index) => (
                        <div key={`base64-${index}`} className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                          <img src={src} alt={`hotel-base64-${index}`} className="w-full h-24 object-cover" />
                        </div>
                      ))
                      : null}
                    {detailData.main_image_url && Array.isArray(detailData.main_image_url) && detailData.main_image_url.length > 0
                      ? detailData.main_image_url.map((src, index) => (
                        <div key={`url-${index}`} className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                          <img src={src} alt={`hotel-url-${index}`} className="w-full h-24 object-cover" />
                        </div>
                      ))
                      : null}
                    {(!detailData.main_image_base64 || detailData.main_image_base64.length === 0) &&
                      (!detailData.main_image_url || detailData.main_image_url.length === 0) && (
                      <p className="text-sm text-slate-500">--</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400">设施</p>
                  <p className="mt-1 text-slate-700 dark:text-slate-200">
                    {Array.isArray(detailData.facilities) && detailData.facilities.length
                      ? detailData.facilities.map((item) => item.name || item.id).filter(Boolean).join('、')
                      : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">服务</p>
                  <p className="mt-1 text-slate-700 dark:text-slate-200">
                    {Array.isArray(detailData.services) && detailData.services.length
                      ? detailData.services.map((item) => item.name || item.id).filter(Boolean).join('、')
                      : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">标签</p>
                  <p className="mt-1 text-slate-700 dark:text-slate-200">
                    {Array.isArray(detailData.tags) && detailData.tags.length ? detailData.tags.join('、') : '--'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">取消政策</p>
                    <p className="mt-1 text-slate-700 dark:text-slate-200">{detailData.policies?.cancellation || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">支付政策</p>
                    <p className="mt-1 text-slate-700 dark:text-slate-200">{detailData.policies?.payment || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">儿童政策</p>
                    <p className="mt-1 text-slate-700 dark:text-slate-200">{detailData.policies?.children || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">宠物政策</p>
                    <p className="mt-1 text-slate-700 dark:text-slate-200">{detailData.policies?.pets || '--'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400">房型价格</p>
                  <div className="mt-2 space-y-2">
                    {detailData.room_prices && Object.keys(detailData.room_prices).length ? (
                      Object.entries(detailData.room_prices).map(([name, room]) => (
                        <details key={name} className="group rounded-lg border border-slate-200 dark:border-slate-700">
                          <summary className="cursor-pointer list-none px-3 py-2 flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{name}</p>
                              <p className="text-xs text-slate-500">
                                {room?.area ? `${room.area}㎡` : '--'} · {room?.bed_type || '--'}
                              </p>
                            </div>
                            <span className="material-symbols-outlined text-base text-slate-400 group-open:rotate-180 transition-transform">expand_more</span>
                          </summary>
                          <div className="px-3 pb-3">
                            <p className="text-xs text-slate-500 mt-1">{room?.description || '--'}</p>
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-500">
                              <div>
                                <p className="text-[10px] text-slate-400">标签</p>
                                <p className="mt-1">{room?.tags && room.tags.length ? room.tags.join('、') : '--'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-400">设施</p>
                                <p className="mt-1">
                                  {room?.facilities && room.facilities.length
                                    ? room.facilities.map((item) => item.name || item.id).filter(Boolean).join('、')
                                    : '--'}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-400">服务</p>
                                <p className="mt-1">
                                  {room?.services && room.services.length
                                    ? room.services.map((item) => item.name || item.id).filter(Boolean).join('、')
                                    : '--'}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-400">政策</p>
                                <p className="mt-1">
                                  {room?.policies?.cancellation || '--'} · {room?.policies?.payment || '--'}
                                </p>
                                <p className="mt-1">
                                  {room?.policies?.children || '--'} · {room?.policies?.pets || '--'}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                              {room?.room_image_base64 && Array.isArray(room.room_image_base64) && room.room_image_base64.length > 0
                                ? room.room_image_base64.map((src, index) => (
                                  <div key={`${name}-base64-${index}`} className="rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                                    <img src={src} alt={`${name}-base64-${index}`} className="w-full h-20 object-cover" />
                                  </div>
                                ))
                                : null}
                              {room?.room_image_url && Array.isArray(room.room_image_url) && room.room_image_url.length > 0
                                ? room.room_image_url.map((src, index) => (
                                  <div key={`${name}-url-${index}`} className="rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                                    <img src={src} alt={`${name}-url-${index}`} className="w-full h-20 object-cover" />
                                  </div>
                                ))
                                : room?.room_image_url ? (
                                  <div className="rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                                    <img src={room.room_image_url} alt={`${name}-url`} className="w-full h-20 object-cover" />
                                  </div>
                                ) : null}
                              {room?.room_image_base64 && !Array.isArray(room.room_image_base64) && (
                                <div className="rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                                  <img src={room.room_image_base64} alt={`${name}-base64`} className="w-full h-20 object-cover" />
                                </div>
                              )}
                            </div>
                            <div className="mt-3">
                              <p className="text-[10px] text-slate-400">价格</p>
                              <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                                {room?.prices && Object.keys(room.prices).length
                                  ? Object.entries(room.prices).map(([date, price]) => (
                                    <div key={`${name}-${date}`} className="flex items-center justify-between text-xs text-slate-500 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1">
                                      <span>{date}</span>
                                      <span>¥ {Number(price).toFixed(2)}</span>
                                    </div>
                                  ))
                                  : <span className="text-xs text-slate-500">--</span>}
                              </div>
                            </div>
                          </div>
                        </details>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">--</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {offlineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={closeOfflineModal}>
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">酒店下线</p>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  确认下线 {offlineHotel?.hotel_name_cn || '该酒店'}？
                </h4>
              </div>
              <button type="button" className="text-sm font-semibold text-slate-500 hover:text-primary" onClick={closeOfflineModal}>
                关闭
              </button>
            </div>
            <div className="mt-4 space-y-2">
              <label className="block text-xs font-semibold text-slate-500">下线原因</label>
              <textarea
                className="w-full min-h-[100px] px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                placeholder="请输入下线原因"
                value={offlineReason}
                onChange={(event) => setOfflineReason(event.target.value)}
              />
              {actionError && <p className="text-xs text-rose-500">{actionError}</p>}
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary"
                onClick={closeOfflineModal}
                disabled={actionLoadingId === offlineHotel?.hotel_id}
              >
                取消
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg disabled:opacity-60"
                onClick={handleConfirmOffline}
                disabled={!offlineReason.trim() || actionLoadingId === offlineHotel?.hotel_id}
              >
                {actionLoadingId === offlineHotel?.hotel_id ? '提交中...' : '确认下线'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
