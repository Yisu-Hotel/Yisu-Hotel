import React, { useEffect, useMemo, useRef, useState } from 'react';
import { mutate } from 'swr';
import CreateHotel from './CreateHotel';
import { deleteHotel, fetchHotelDetail, fetchHotelPage } from '../../utils/api';
const PAGE_SIZE = 10;
const DEFAULT_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420"><rect width="640" height="420" fill="%23e2e8f0"/><path d="M180 280l90-110 90 110 60-70 110 130H180z" fill="%23cbd5f5"/><circle cx="420" cy="150" r="40" fill="%23cbd5f5"/></svg>';

const STATUS_OPTIONS = [
  { value: 'draft', label: '草稿', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
  { value: 'pending', label: '待审核', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { value: 'published', label: '已发布', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { value: 'rejected', label: '已拒绝', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' }
];

const resolveHotelImage = (hotel) => {
  const base64Images = hotel?.main_image_base64;
  if (Array.isArray(base64Images)) {
    const base64Image = base64Images.find((item) => typeof item === 'string' && item);
    if (base64Image) {
      return base64Image;
    }
  } else if (typeof base64Images === 'string' && base64Images) {
    return base64Images;
  }

  const images = hotel?.main_image_url;
  if (Array.isArray(images)) {
    const urlImage = images.find((item) => typeof item === 'string' && item);
    return urlImage || DEFAULT_IMAGE;
  }
  if (typeof images === 'string' && images) {
    return images;
  }
  return DEFAULT_IMAGE;
};

const formatLocation = (locationInfo = {}) => {
  const city = locationInfo.city || '';
  const address = locationInfo.formatted_address || locationInfo.street || locationInfo.district || '';
  return { city, address };
};

const getRoomPriceRange = (prices) => {
  const values = Object.values(prices || {}).map((value) => Number(value)).filter((value) => Number.isFinite(value));
  if (values.length === 0) {
    return '--';
  }
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  if (minValue === maxValue) {
    return minValue.toFixed(2);
  }
  return `${minValue.toFixed(2)} - ${maxValue.toFixed(2)}`;
};

const statusBadgeStyle = (status) => {
  if (status === 'pending') {
    return 'bg-amber-500 text-white';
  }
  if (status === 'published') {
    return 'bg-emerald-500 text-white';
  }
  if (status === 'rejected') {
    return 'bg-rose-500 text-white';
  }
  if (status === 'draft') {
    return 'bg-slate-500 text-white';
  }
  return 'bg-slate-400 text-white';
};

const DetailModal = ({ open, loading, error, data, onClose, fallbackName }) => {
  if (!open) {
    return null;
  }

  const facilities = (data?.facilities || []).map((item) => item.name || item.id).filter(Boolean);
  const services = (data?.services || []).map((item) => item.name || item.id).filter(Boolean);
  const tags = data?.tags || [];
  const roomEntries = Object.entries(data?.room_prices || {});
  const policies = data?.policies || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">酒店详情</p>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {data?.hotel_name_cn || fallbackName || '未命名酒店'}
            </h4>
            <p className="text-xs text-slate-400">{data?.hotel_name_en || '--'}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${statusBadgeStyle(data?.status)}`}>
              {data?.status || '--'}
            </span>
            <button type="button" className="text-sm font-semibold text-slate-500 hover:text-primary" onClick={onClose}>
              关闭
            </button>
          </div>
        </div>
        {loading ? (
          <div className="mt-6 space-y-3 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          </div>
        ) : error ? (
          <div className="mt-6 text-sm text-rose-500 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/40 rounded-lg p-4">
            {error}
          </div>
        ) : (
          <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">酒店ID</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{data?.hotel_id || '--'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">星级</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{data?.star_rating || '--'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">电话</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{data?.phone || '--'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">开业时间</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{data?.opening_date || '--'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-slate-400">地址</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{data?.location_info?.formatted_address || '--'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400">酒店描述</p>
              <p className="mt-1 text-slate-700 dark:text-slate-200">{data?.description || '--'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-400">设施</p>
                <p className="mt-1 text-slate-700 dark:text-slate-200">{facilities.length ? facilities.join('、') : '--'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">服务</p>
                <p className="mt-1 text-slate-700 dark:text-slate-200">{services.length ? services.join('、') : '--'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">标签</p>
                <p className="mt-1 text-slate-700 dark:text-slate-200">{tags.length ? tags.join('、') : '--'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">取消政策</p>
                <p className="mt-1 text-slate-700 dark:text-slate-200">{policies.cancellation || '--'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">支付政策</p>
                <p className="mt-1 text-slate-700 dark:text-slate-200">{policies.payment || '--'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">儿童政策</p>
                <p className="mt-1 text-slate-700 dark:text-slate-200">{policies.children || '--'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">宠物政策</p>
                <p className="mt-1 text-slate-700 dark:text-slate-200">{policies.pets || '--'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400">房型价格</p>
              <div className="mt-2 space-y-2">
                {roomEntries.length ? roomEntries.map(([name, room]) => (
                  <div key={name} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-2 justify-between">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">{name}</p>
                      <span className="text-xs font-semibold text-primary">{getRoomPriceRange(room.prices)}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {room.bed_type || '--'} · {room.area ? `${room.area}㎡` : '--'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{room.description || '--'}</p>
                  </div>
                )) : (
                  <p className="text-slate-500">--</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ open, hotelName, loading, error, onCancel, onConfirm }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">删除酒店</p>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              确认删除 {hotelName || '该酒店'}？
            </h4>
          </div>
          <button type="button" className="text-sm font-semibold text-slate-500 hover:text-primary" onClick={onCancel}>
            关闭
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          删除后将无法恢复，请谨慎操作。
        </p>
        {error ? (
          <div className="mt-4 text-sm text-rose-500 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/40 rounded-lg p-3">
            {error}
          </div>
        ) : null}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary"
            onClick={onCancel}
            disabled={loading}
          >
            取消
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg disabled:opacity-60"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? '删除中...' : '确认删除'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Listings() {
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [selectedHotelName, setSelectedHotelName] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailData, setDetailData] = useState(null);
  const [deleteHotelId, setDeleteHotelId] = useState('');
  const [deleteHotelName, setDeleteHotelName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState(() => STATUS_OPTIONS.map((item) => item.value));
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const statusRef = useRef(null);
  const [editHotelId, setEditHotelId] = useState('');
  const [editInitialData, setEditInitialData] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setError('请先登录');
      return;
    }

    const fetchPage = (page, size) => fetchHotelPage({ token, page, size });

    let isActive = true;
    setLoading(true);
    fetchPage(1, 100)
      .then(async (firstPage) => {
        const total = firstPage.total || 0;
        const totalPages = Math.max(1, Math.ceil(total / 100));
        if (totalPages === 1) {
          return firstPage.list || [];
        }
        const restPages = await Promise.all(
          Array.from({ length: totalPages - 1 }).map((_, index) => fetchPage(index + 2, 100))
        );
        const list = [firstPage.list || [], ...restPages.map((page) => page.list || [])].flat();
        return list;
      })
      .then((list) => {
        if (!isActive) {
          return;
        }
        setHotels(list || []);
        setError('');
      })
      .catch((fetchError) => {
        if (!isActive) {
          return;
        }
        setError(fetchError.message || '加载失败');
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [refreshTrigger]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatuses, debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredHotels = useMemo(() => {
    const keyword = debouncedSearch.toLowerCase();
    return (hotels || []).filter((hotel) => {
      const statusMatch = selectedStatuses.includes(hotel.status);
      if (!statusMatch) {
        return false;
      }
      if (!keyword) {
        return true;
      }
      const location = formatLocation(hotel.location_info);
      const haystack = [
        hotel.hotel_name_cn,
        hotel.hotel_name_en,
        location.city,
        location.address
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [hotels, selectedStatuses, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredHotels.length / PAGE_SIZE));
  const pageList = filteredHotels.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const statusLabel = selectedStatuses.length === STATUS_OPTIONS.length
    ? '全部状态'
    : STATUS_OPTIONS.filter((item) => selectedStatuses.includes(item.value)).map((item) => item.label).join(' / ');

  const handleStatusToggle = (value) => {
    setSelectedStatuses((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      }
      return [...prev, value];
    });
  };

  const handleSelectAllStatuses = () => {
    setSelectedStatuses(STATUS_OPTIONS.map((item) => item.value));
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }
    setCurrentPage(nextPage);
  };

  const handleViewDetail = async (hotel) => {
    const token = localStorage.getItem('token');
    setSelectedHotelId(hotel?.hotel_id || '');
    setSelectedHotelName(hotel?.hotel_name_cn || '');
    setDetailError('');
    setDetailData(null);
    if (!token) {
      setDetailLoading(false);
      setDetailError('请先登录');
      return;
    }
    if (!hotel?.hotel_id) {
      setDetailLoading(false);
      setDetailError('酒店ID无效');
      return;
    }
    setDetailLoading(true);
    try {
      const data = await fetchHotelDetail({ token, hotelId: hotel.hotel_id });
      setDetailData(data);
      setDetailError('');
    } catch (fetchError) {
      setDetailError(fetchError.message || '加载失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedHotelId('');
    setSelectedHotelName('');
    setDetailError('');
    setDetailData(null);
    setDetailLoading(false);
  };

  const handleEdit = async (hotel) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('请先登录');
      return;
    }
    if (!hotel?.hotel_id) {
      alert('酒店ID无效');
      return;
    }
    try {
      setEditHotelId(hotel.hotel_id);
      const data = await fetchHotelDetail({ token, hotelId: hotel.hotel_id });
      setEditInitialData(data);
      setIsCreating(true);
    } catch (fetchError) {
      alert(fetchError.message || '加载失败');
    }
  };

  const handleOpenDelete = (hotel) => {
    setDeleteHotelId(hotel?.hotel_id || '');
    setDeleteHotelName(hotel?.hotel_name_cn || '');
    setDeleteError('');
  };

  const handleCloseDelete = () => {
    setDeleteHotelId('');
    setDeleteHotelName('');
    setDeleteError('');
    setDeleteLoading(false);
  };

  const handleConfirmDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setDeleteError('请先登录');
      return;
    }
    if (!deleteHotelId) {
      setDeleteError('酒店ID无效');
      return;
    }
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteHotel({ token, hotelId: deleteHotelId });
      setHotels((prev) => (prev || []).filter((hotel) => hotel.hotel_id !== deleteHotelId));
      mutate(['hotel-all', token]);
      handleCloseDelete();
    } catch (fetchError) {
      setDeleteError(fetchError.message || '删除失败');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatNumber = (value) => {
    const numberValue = Number(value) || 0;
    return new Intl.NumberFormat('zh-CN').format(numberValue);
  };

  const handleBackFromCreate = (shouldRefresh = false) => {
    setIsCreating(false);
    setEditHotelId('');
    setEditInitialData(null);
    if (shouldRefresh) {
      setRefreshTrigger((prev) => prev + 1);
      const token = localStorage.getItem('token');
      if (token) {
        mutate(['hotel-all', token]);
      }
    }
  };

  if (isCreating) {
    return (
      <CreateHotel
        onBack={handleBackFromCreate}
        hotelId={editHotelId}
        initialData={editInitialData}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8 bg-background-light dark:bg-slate-950">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="sticky top-0 z-10 bg-background-light dark:bg-slate-950 pt-2">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary"
                  placeholder="搜索酒店名称或地点..."
                  type="text"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-slate-500">状态筛选:</span>
                <div className="relative" ref={statusRef}>
                  <button
                    type="button"
                    className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 flex items-center gap-2"
                    onClick={() => setStatusOpen((prev) => !prev)}
                  >
                    <span className="text-slate-600 dark:text-slate-300">{statusLabel || '请选择状态'}</span>
                    <span className="material-symbols-outlined text-base">expand_more</span>
                  </button>
                  {statusOpen && (
                    <div className="absolute z-20 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg overflow-hidden">
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 text-sm font-semibold text-primary hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={handleSelectAllStatuses}
                      >
                        全选
                      </button>
                      {STATUS_OPTIONS.map((item) => (
                        <label key={item.value} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded text-primary"
                            checked={selectedStatuses.includes(item.value)}
                            onChange={() => handleStatusToggle(item.value)}
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
                  onClick={() => setIsCreating(true)}
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  添加新酒店
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
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
            ) : pageList.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-3">sentiment_dissatisfied</span>
                <p className="text-sm">暂无符合条件的酒店</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                        <th className="px-6 py-4">酒店信息</th>
                        <th className="px-6 py-4">地点</th>
                        <th className="px-6 py-4">状态</th>
                        <th className="px-6 py-4">预定量</th>
                        <th className="px-6 py-4 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {pageList.map((hotel) => {
                        const statusConfig = STATUS_OPTIONS.find((item) => item.value === hotel.status);
                        const location = formatLocation(hotel.location_info);
                        return (
                          <tr key={hotel.hotel_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                  <img alt={hotel.hotel_name_cn} className="w-full h-full object-cover" src={resolveHotelImage(hotel)} />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white">{hotel.hotel_name_cn || '--'}</p>
                                  <p className="text-xs text-slate-500">{hotel.hotel_name_en || '--'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-sm">
                              <p className="text-slate-700 dark:text-slate-300">{location.city || '--'}</p>
                              <p className="text-[10px] text-slate-500">{location.address || '--'}</p>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig?.color || 'bg-slate-100 text-slate-700'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                                {statusConfig?.label || '--'}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">{formatNumber(hotel.booking_count)}</span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex items-center justify-end gap-3 text-sm font-semibold">
                                <button className="text-slate-500 hover:text-primary" onClick={() => handleEdit(hotel)}>编辑</button>
                                <button className="text-slate-500 hover:text-primary" onClick={() => handleViewDetail(hotel)}>查看详情</button>
                                <button className="text-slate-500 hover:text-rose-500" onClick={() => handleOpenDelete(hotel)}>删除</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    显示第 <span className="font-semibold text-slate-700 dark:text-slate-300">{(currentPage - 1) * PAGE_SIZE + 1}</span> -
                    <span className="font-semibold text-slate-700 dark:text-slate-300"> {Math.min(currentPage * PAGE_SIZE, filteredHotels.length)}</span> 条，共
                    <span className="font-semibold text-slate-700 dark:text-slate-300"> {filteredHotels.length}</span> 条
                  </p>
                  <div className="flex gap-2">
                    <button
                      className={`px-3 py-1 border border-slate-200 dark:border-slate-700 rounded text-sm font-medium ${currentPage === 1 ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'}`}
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      上一页
                    </button>
                    <button
                      className={`px-3 py-1 border border-slate-200 dark:border-slate-700 rounded text-sm font-medium ${currentPage === totalPages ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50'}`}
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      下一页
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <DetailModal
        open={Boolean(selectedHotelId)}
        loading={detailLoading}
        error={detailError}
        data={detailData}
        fallbackName={selectedHotelName}
        onClose={handleCloseDetail}
      />
      <DeleteConfirmModal
        open={Boolean(deleteHotelId)}
        hotelName={deleteHotelName}
        loading={deleteLoading}
        error={deleteError}
        onCancel={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
