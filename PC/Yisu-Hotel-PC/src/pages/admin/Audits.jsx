import React, { useEffect, useMemo, useState } from 'react';
import { fetchAdminAuditList, fetchAdminHotelDetail, submitAdminHotelAudit } from '../../utils/api';

const statusBadge = (status) => {
  if (status === 'pending') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  if (status === 'published') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (status === 'rejected') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
};

const statusText = (status) => {
  if (status === 'pending') return '待审核';
  if (status === 'published') return '已发布';
  if (status === 'rejected') return '已拒绝';
  return status || '-';
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', { hour12: false });
};

const formatLocation = (locationInfo = {}) => {
  const city = locationInfo.city || '';
  const district = locationInfo.district || '';
  const address = locationInfo.formatted_address || locationInfo.street || '';
  return { city, district, address };
};

export default function Audits() {
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hotels, setHotels] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailData, setDetailData] = useState(null);
  const [actionLoading, setActionLoading] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [rejectReason, setRejectReason] = useState('');

  const totalPages = useMemo(() => Math.max(1, Math.ceil(hotels.length / pageSize)), [hotels, pageSize]);

  const pagedHotels = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return hotels.slice(start, start + pageSize);
  }, [hotels, currentPage, pageSize]);

  const selectedHotel = useMemo(
    () => hotels.find((hotel) => hotel.hotel_id === selectedHotelId) || null,
    [hotels, selectedHotelId]
  );

  const loadHotels = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('请先登录');
      setHotels([]);
      setSelectedHotelId('');
      return () => {};
    }

    let isActive = true;
    setLoading(true);
    setError('');
    setActionMessage('');
    setActionError('');
    fetchAdminAuditList({ token, status: 'pending', page: 1, pageSize: 50 })
      .then((data) => {
        if (!isActive) {
          return;
        }
        const list = Array.isArray(data?.list) ? data.list : [];
        setHotels(list);
        setCurrentPage(1);
        setSelectedHotelId(list[0]?.hotel_id || '');
      })
      .catch((fetchError) => {
        if (!isActive) {
          return;
        }
        setError(fetchError.message || '加载失败');
        setHotels([]);
        setSelectedHotelId('');
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

  useEffect(() => loadHotels(), []);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!pagedHotels.length) {
      setSelectedHotelId('');
      return;
    }
    const exists = hotels.some((hotel) => hotel.hotel_id === selectedHotelId);
    if (!selectedHotelId || !exists) {
      setSelectedHotelId(pagedHotels[0].hotel_id);
    }
  }, [pagedHotels, hotels, selectedHotelId]);

  const handleSelectHotel = (hotelId) => {
    setSelectedHotelId(hotelId);
    setRejectReason('');
    setActionMessage('');
    setActionError('');
  };

  const canReject = rejectReason.trim().length > 0;

  const submitAudit = async (status) => {
    if (!selectedHotelId) {
      setActionError('请选择酒店');
      return;
    }
    if (status === 'rejected' && !canReject) {
      setActionError('请输入驳回原因');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setActionError('请先登录');
      return;
    }
    setActionLoading(status);
    setActionMessage('');
    setActionError('');
    try {
      await submitAdminHotelAudit({
        token,
        hotelIds: [selectedHotelId],
        status,
        rejectReason: status === 'rejected' ? rejectReason.trim() : undefined
      });
      setActionMessage(status === 'published' ? '已发布' : '已驳回');
      setRejectReason('');
      setDetailData(null);
      loadHotels();
    } catch (requestError) {
      setActionError(requestError.message || '操作失败');
    } finally {
      setActionLoading('');
    }
  };

  useEffect(() => {
    if (!selectedHotelId) {
      setDetailData(null);
      setDetailError('');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setDetailError('请先登录');
      setDetailData(null);
      return;
    }
    let isActive = true;
    setDetailLoading(true);
    setDetailError('');
    fetchAdminHotelDetail({ token, hotelId: selectedHotelId })
      .then((data) => {
        if (!isActive) {
          return;
        }
        setDetailData(data || null);
      })
      .catch((fetchError) => {
        if (!isActive) {
          return;
        }
        setDetailError(fetchError.message || '加载失败');
        setDetailData(null);
      })
      .finally(() => {
        if (isActive) {
          setDetailLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [selectedHotelId]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[640px]">
      <div className="flex flex-col lg:flex-row h-full">
        <section className="lg:w-1/2 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">酒店审核列表</h3>
                  <p className="text-xs text-slate-500">展示待审核 / 已发布 / 已拒绝的酒店</p>
                </div>
                <button type="button" className="text-xs font-semibold text-primary/70 cursor-not-allowed" disabled>
                  刷新
                </button>
              </div>
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    search
                  </span>
                  <input
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-primary"
                    placeholder="搜索酒店名称或ID"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="p-6 text-sm text-slate-500">正在加载酒店列表...</div>
            )}
            {!loading && error && (
              <div className="p-6 text-sm text-rose-500">{error}</div>
            )}
            {!loading && !error && hotels.length === 0 && (
              <div className="p-6 text-sm text-slate-500">暂无待审核酒店</div>
            )}
            {!loading && !error && pagedHotels.map((hotel) => {
              const isActive = hotel.hotel_id === selectedHotelId;
              return (
                <button
                  key={hotel.hotel_id}
                  type="button"
                  onClick={() => handleSelectHotel(hotel.hotel_id)}
                  className={`w-full text-left p-5 border-b border-slate-100 dark:border-slate-800 transition-colors ${
                    isActive ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{hotel.hotel_name_cn}</h4>
                      <p className="text-xs text-slate-500 mt-1">{hotel.hotel_id}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadge(hotel.status)}`}>
                      {statusText(hotel.status)}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-slate-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      {formatDate(hotel.submitted_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">apartment</span>
                      {formatLocation(hotel.location_info).city || '--'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
        </section>

        <section className="flex-1 bg-slate-50 dark:bg-slate-900 flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">酒店详情</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedHotel ? `${selectedHotel.hotel_name_cn} (${statusText(selectedHotel.status)})` : '请选择酒店'}
                </p>
              </div>
              <button type="button" className="text-xs font-semibold text-primary/70 cursor-not-allowed" disabled>
                刷新
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!selectedHotelId && <div className="text-sm text-slate-500">请选择左侧酒店查看详情</div>}
            {selectedHotelId && detailLoading && (
              <div className="text-sm text-slate-500">正在加载酒店详情...</div>
            )}
            {selectedHotelId && !detailLoading && detailError && (
              <div className="text-sm text-rose-500">{detailError}</div>
            )}
            {selectedHotelId && !detailLoading && !detailError && actionMessage && (
              <div className="text-sm text-emerald-600">{actionMessage}</div>
            )}
            {selectedHotelId && !detailLoading && !detailError && actionError && (
              <div className="text-sm text-rose-500">{actionError}</div>
            )}
            {selectedHotelId && !detailLoading && !detailError && detailData && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
                  <div>
                    <p className="text-xs text-slate-400">酒店ID</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{detailData.hotel_id || '--'}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">酒店名称</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{detailData.hotel_name_cn || '--'}</p>
                      <p className="text-xs text-slate-500">{detailData.hotel_name_en || '--'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">状态</p>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusBadge(detailData.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                        {statusText(detailData.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">星级</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{detailData.star_rating || '--'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">联系电话</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{detailData.phone || '--'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">开业时间</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{detailData.opening_date || '--'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">提交人</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{detailData.created_by || '--'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-slate-400">地址</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {formatLocation(detailData.location_info).address || '--'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatLocation(detailData.location_info).city || '--'} {formatLocation(detailData.location_info).district || ''}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">酒店简介</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">{detailData.description || '--'}</p>
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
                    <p className="text-xs text-slate-400">周边信息</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">{detailData.nearby_info || '--'}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">设施</p>
                      <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">
                        {Array.isArray(detailData.facilities) && detailData.facilities.length
                          ? detailData.facilities.map((item) => item.name || item.id).filter(Boolean).join('、')
                          : '--'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">服务</p>
                      <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">
                        {Array.isArray(detailData.services) && detailData.services.length
                          ? detailData.services.map((item) => item.name || item.id).filter(Boolean).join('、')
                          : '--'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">标签</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">
                      {Array.isArray(detailData.tags) && detailData.tags.length ? detailData.tags.join('、') : '--'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">取消政策</p>
                      <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">{detailData.policies?.cancellation || '--'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">支付政策</p>
                      <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">{detailData.policies?.payment || '--'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">儿童政策</p>
                      <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">{detailData.policies?.children || '--'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">宠物政策</p>
                      <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">{detailData.policies?.pets || '--'}</p>
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
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
                      onClick={() => submitAudit('published')}
                      disabled={actionLoading === 'published' || actionLoading === 'rejected'}
                    >
                      {actionLoading === 'published' ? '提交中...' : '发布'}
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                        canReject ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-rose-200 text-rose-400 cursor-not-allowed'
                      }`}
                      onClick={() => submitAudit('rejected')}
                      disabled={!canReject || actionLoading === 'published' || actionLoading === 'rejected'}
                    >
                      {actionLoading === 'rejected' ? '提交中...' : '驳回'}
                    </button>
                    <div className="flex-1 min-w-[220px]">
                      <input
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                        placeholder="请输入驳回原因"
                        value={rejectReason}
                        onChange={(event) => setRejectReason(event.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
