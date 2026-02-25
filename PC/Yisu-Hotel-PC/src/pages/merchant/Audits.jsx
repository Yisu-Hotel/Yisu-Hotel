import React, { useEffect, useMemo, useRef, useState, useDeferredValue } from 'react';
import useSWR from 'swr';
import { fetchAllHotels, fetchHotelAuditStatus } from '../../utils/api';
const PAGE_SIZE = 20;
const STATUS_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待审核' },
  { value: 'published', label: '已发布' },
  { value: 'rejected', label: '已拒绝' }
];
const SORT_OPTIONS = [
  { value: 'created_desc', label: '提交时间（新到旧）' },
  { value: 'created_asc', label: '提交时间（旧到新）' },
  { value: 'name_asc', label: '酒店名称（A-Z）' },
  { value: 'name_desc', label: '酒店名称（Z-A）' }
];

// 从本地读取登录 Token
const getToken = () => localStorage.getItem('token');

const HOTEL_PAGE_SIZE = 100;

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
  if (status === 'draft') return '草稿';
  return status || '-';
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', { hour12: false });
};

const normalizeKeyword = (value) => value.trim().toLowerCase();

export default function Audits() {
  const token = getToken();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState('created_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  // 延迟处理搜索词以降低大列表渲染压力
  const deferredKeyword = useDeferredValue(keyword);
  // 审核记录缓存，避免重复请求
  const auditCacheRef = useRef(new Map());

  const {
    data: hotelData,
    isLoading: hotelsLoading,
    error: hotelsError,
    mutate: refreshHotels
  } = useSWR(token ? ['hotel-all', token] : null, () => fetchAllHotels({ token, pageSize: HOTEL_PAGE_SIZE }), {
    revalidateOnFocus: false
  });

  const rawHotels = useMemo(() => hotelData?.list || [], [hotelData]);

  const filteredHotels = useMemo(() => {
    const allowedStatuses = new Set(['pending', 'published', 'rejected']);
    const baseList = rawHotels.filter((hotel) => allowedStatuses.has(hotel.status));
    const search = normalizeKeyword(deferredKeyword);
    const filtered = baseList.filter((hotel) => {
      if (statusFilter !== 'all' && hotel.status !== statusFilter) {
        return false;
      }
      if (!search) {
        return true;
      }
      return (
        String(hotel.hotel_name_cn || '').toLowerCase().includes(search) ||
        String(hotel.hotel_name_en || '').toLowerCase().includes(search) ||
        String(hotel.hotel_id || '').toLowerCase().includes(search)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === 'name_asc') {
        return String(a.hotel_name_cn || '').localeCompare(String(b.hotel_name_cn || ''), 'zh-CN');
      }
      if (sortKey === 'name_desc') {
        return String(b.hotel_name_cn || '').localeCompare(String(a.hotel_name_cn || ''), 'zh-CN');
      }
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      if (sortKey === 'created_asc') {
        return timeA - timeB;
      }
      return timeB - timeA;
    });

    return sorted;
  }, [rawHotels, deferredKeyword, statusFilter, sortKey]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredHotels.length / pageSize)), [filteredHotels, pageSize]);

  const pagedHotels = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHotels.slice(start, start + pageSize);
  }, [filteredHotels, currentPage, pageSize]);

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
    const exists = filteredHotels.some((hotel) => hotel.hotel_id === selectedHotelId);
    if (!selectedHotelId || !exists) {
      setSelectedHotelId(pagedHotels[0].hotel_id);
    }
  }, [pagedHotels, filteredHotels, selectedHotelId]);

  const selectedHotel = useMemo(
    () => filteredHotels.find((hotel) => hotel.hotel_id === selectedHotelId) || null,
    [filteredHotels, selectedHotelId]
  );

  const {
    data: auditData,
    isLoading: auditLoading,
    error: auditError,
    mutate: refreshAudit
  } = useSWR(
    token && selectedHotelId ? ['audit-status', token, selectedHotelId] : null,
    () => fetchHotelAuditStatus({ token, hotelId: selectedHotelId }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30 * 1000
    }
  );

  useEffect(() => {
    if (selectedHotelId && Array.isArray(auditData)) {
      auditCacheRef.current.set(selectedHotelId, auditData);
    }
  }, [selectedHotelId, auditData]);

  // 对审核记录进行兜底缓存与排序
  const auditLogs = useMemo(() => {
    const cached = auditCacheRef.current.get(selectedHotelId) || [];
    const list = Array.isArray(auditData) ? auditData : cached;
    return [...list].sort((a, b) => new Date(b.audited_at || b.submitted_at || 0) - new Date(a.audited_at || a.submitted_at || 0));
  }, [auditData, selectedHotelId]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[640px]">
      <div className="flex flex-col lg:flex-row h-full">
        <section className="lg:w-1/2 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">酒店审核列表</h3>
                  <p className="text-xs text-slate-500">仅展示待审核 / 已发布 / 已拒绝的酒店</p>
                </div>
                <button
                  type="button"
                  onClick={() => refreshHotels()}
                  className="text-xs font-semibold text-primary hover:text-primary/80"
                >
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
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                  />
                </div>
                <select
                  className="w-full md:w-32 py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  className="w-full md:w-44 py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  value={sortKey}
                  onChange={(event) => setSortKey(event.target.value)}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {hotelsLoading && (
              <div className="p-6 text-sm text-slate-500">正在加载酒店列表...</div>
            )}
            {hotelsError && (
              <div className="p-6 text-sm text-rose-500 flex items-center gap-3">
                <span>酒店列表加载失败</span>
                <button type="button" onClick={() => refreshHotels()} className="text-primary text-xs font-semibold">
                  重试
                </button>
              </div>
            )}
            {!hotelsLoading && !hotelsError && pagedHotels.length === 0 && (
              <div className="p-6 text-sm text-slate-500">暂无符合条件的酒店</div>
            )}
            {!hotelsLoading && !hotelsError && pagedHotels.map((hotel) => {
              const isActive = hotel.hotel_id === selectedHotelId;
              return (
                <button
                  key={hotel.hotel_id}
                  type="button"
                  onClick={() => setSelectedHotelId(hotel.hotel_id)}
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
                      {formatDate(hotel.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">hotel</span>
                      {hotel.star_rating || '-'} 星
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-xs text-slate-500">
              共 {filteredHotels.length} 家酒店 | 第 {currentPage} / {totalPages} 页
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
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">审核历史</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedHotel ? `${selectedHotel.hotel_name_cn} (${statusText(selectedHotel.status)})` : '请选择酒店'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => refreshAudit()}
                disabled={!selectedHotelId}
                className="text-xs font-semibold text-primary hover:text-primary/80 disabled:opacity-50"
              >
                刷新
              </button>
            </div>
          </div>

          <div className={`flex-1 overflow-y-auto p-6 transition-opacity duration-300 ${auditLoading ? 'opacity-60' : 'opacity-100'}`}>
            {!selectedHotelId && (
              <div className="text-sm text-slate-500">暂无可展示的审核记录</div>
            )}
            {selectedHotelId && auditLoading && (
              <div className="text-sm text-slate-500">正在加载审核历史...</div>
            )}
            {selectedHotelId && auditError && (
              <div className="text-sm text-rose-500 flex items-center gap-3">
                <span>审核历史加载失败</span>
                <button type="button" onClick={() => refreshAudit()} className="text-primary text-xs font-semibold">
                  重试
                </button>
              </div>
            )}
            {selectedHotelId && !auditLoading && !auditError && auditLogs.length === 0 && (
              <div className="text-sm text-slate-500">该酒店暂无审核记录</div>
            )}
            {selectedHotelId && !auditLoading && !auditError && auditLogs.length > 0 && (
              <div className="space-y-4">
                {auditLogs.map((log, index) => (
                  <div key={`${log.audited_at || log.submitted_at || index}`} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{statusText(log.status)}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          审核时间：{formatDate(log.audited_at || log.submitted_at)}
                        </p>
                        <p className="text-xs text-slate-500">审核人：{log.audited_by || '-'}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadge(log.status)}`}>
                        {statusText(log.status)}
                      </span>
                    </div>
                    {log.reject_reason && (
                      <div className="mt-3 text-xs text-rose-500 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-lg p-3">
                        审核意见：{log.reject_reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
