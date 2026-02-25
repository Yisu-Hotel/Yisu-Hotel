import React, { useEffect, useState } from 'react';
import { fetchHotelDetail, sendChatCompletions } from '../../utils/api';
const DEFAULT_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420"><rect width="640" height="420" fill="%23e2e8f0"/><path d="M180 280l90-110 90 110 60-70 110 130H180z" fill="%23cbd5f5"/><circle cx="420" cy="150" r="40" fill="%23cbd5f5"/></svg>';
const CHAT_STORAGE_KEY = 'merchant_chat_history';
const MAX_CHAT_ROUNDS = 10;
const MAX_CHAT_MESSAGES = MAX_CHAT_ROUNDS * 2;

const StatCard = ({ title, value, icon, loading }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">{icon}</div>
    </div>
    <p className="text-slate-500 text-sm font-medium">{title}</p>
    {loading ? (
      <div className="mt-2 h-8 w-24 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
    ) : (
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
    )}
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-pulse">
    <div className="h-40 bg-slate-200 dark:bg-slate-700" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
      <div className="grid grid-cols-4 gap-3">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  </div>
);

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

const trimChatMessages = (messages) => messages.slice(-MAX_CHAT_MESSAGES);

const HotelGrid = ({ hotels, loading, onImageError, onViewDetail }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {(hotels || []).map((hotel) => (
        <div
          key={hotel.hotel_id}
          className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm group hover:shadow-md transition-all relative"
        >
          <div className="relative h-40">
            <img
              alt={hotel.hotel_name_cn}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              src={resolveHotelImage(hotel)}
              loading="lazy"
              onError={onImageError}
            />
            <div className="absolute top-3 right-3">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm ${statusBadgeStyle(hotel.status)}`}>
                {hotel.status || '--'}
              </span>
            </div>
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onViewDetail(hotel)}
            >
              查看详情
            </button>
          </div>
          <div className="p-5">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {hotel.hotel_name_cn}
              </h4>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{hotel.booking_count}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">预订数</span>
              </div>
              <div className="flex flex-col items-center border-l border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{hotel.favorite_count}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">收藏数</span>
              </div>
              <div className="flex flex-col items-center border-l border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{hotel.average_rating}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">评分</span>
              </div>
              <div className="flex flex-col items-center border-l border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{hotel.review_count}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">评价数</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
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

export default function Dashboard({
  stats,
  previewHotels,
  allHotels,
  loading,
  error,
  isViewAll,
  onViewAll,
  onBack,
  onImageError
}) {
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [selectedHotelName, setSelectedHotelName] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailData, setDetailData] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState(() => {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return trimChatMessages(parsed.filter((item) => item && typeof item === 'object' && typeof item.role === 'string' && typeof item.content === 'string'));
    } catch (error) {
      return [];
    }
  });
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatMessages));
  }, [chatMessages]);

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

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  const submitChat = async () => {
    if (chatLoading) {
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setChatError('请先登录');
      return;
    }
    const content = chatInput.trim();
    if (!content) {
      return;
    }
    const nextMessages = trimChatMessages([
      ...chatMessages,
      { role: 'user', content }
    ]);
    const requestMessages = nextMessages.filter((message) => message.role !== 'tool');
    setChatMessages(nextMessages);
    setChatInput('');
    setChatError('');
    setChatLoading(true);
    try {
      const { response, result } = await sendChatCompletions({ token, messages: requestMessages });
      if (!response.ok || result.code !== 0) {
        throw new Error(result.msg || 'AI服务异常');
      }
      const assistantContent = result?.data?.message?.content || '';
      if (!assistantContent) {
        throw new Error('AI服务返回为空');
      }
      const toolCalls = Array.isArray(result?.data?.tool_calls) ? result.data.tool_calls : [];
      const toolMessages = toolCalls.flatMap((call) => {
        const name = call?.name || 'knowledge_base_search';
        const input = call?.input || {};
        const output = call?.output || {};

        let callContent = '';
        let resultContent = '';

        if (name === 'knowledge_base_search') {
          callContent = `🔍 正在检索知识库：\n"${input.query || ''}"`;
          const matches = output.matches || [];
          if (matches.length > 0) {
            resultContent = `✅ 找到 ${matches.length} 条相关参考：\n` +
              matches.map((m, i) => `${i + 1}. 【${m.question}】\n   ${m.answer}`).join('\n\n');
          } else {
            resultContent = '❌ 未能在知识库中找到直接匹配的内容。';
          }
        } else {
          // Fallback for other tools
          const inputText = JSON.stringify(input, null, 2);
          const outputText = JSON.stringify(output, null, 2);
          callContent = `工具调用：${name}${inputText ? `\n${inputText}` : ''}`;
          resultContent = `工具结果：${outputText || '无匹配结果'}`;
        }

        return [
          { role: 'tool', content: callContent },
          { role: 'tool', content: resultContent }
        ];
      });
      setChatMessages(trimChatMessages([
        ...nextMessages,
        ...toolMessages,
        { role: 'assistant', content: assistantContent }
      ]));
    } catch (fetchError) {
      setChatError(fetchError.message || 'AI服务异常');
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendChat = (event) => {
    event.preventDefault();
    submitChat();
  };

  const handleChatKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitChat();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('确定要清空目前的对话历史吗？')) {
      setChatMessages([]);
      setChatError('');
    }
  };

  const detailModal = (
    <DetailModal
      open={Boolean(selectedHotelId)}
      loading={detailLoading}
      error={detailError}
      data={detailData}
      fallbackName={selectedHotelName}
      onClose={handleCloseDetail}
    />
  );

  const chatPanel = isChatOpen ? (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={handleCloseChat}
      />
      <aside className="fixed right-0 top-0 bottom-0 w-full max-w-[400px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl">
        <header className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-primary text-sm font-bold">
              AI
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white leading-tight">易宿 AI 助手</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">在线</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            onClick={handleCloseChat}
          >
            关闭
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {chatMessages.length === 0 ? (
            <div className="text-center text-sm text-slate-400">
              先描述你的问题或需求，AI 将帮助你快速解答。
            </div>
          ) : (
            chatMessages.map((message, index) => {
              const isUser = message.role === 'user';
              const isTool = message.role === 'tool';
              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-primary text-white shadow-sm text-sm'
                        : isTool
                          ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[11px] border border-slate-100 dark:border-slate-800/50 italic'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })
          )}
          {chatLoading ? (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800">
                AI 正在思考...
              </div>
            </div>
          ) : null}
        </div>
        {chatError ? (
          <div className="px-6 pb-2 text-xs text-rose-500">
            {chatError}
          </div>
        ) : null}
        <form onSubmit={handleSendChat} className="border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 space-y-3">
            <textarea
              rows="3"
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={handleChatKeyDown}
              placeholder="输入你的问题，Enter 发送，Shift+Enter 换行"
              className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">保留最近{MAX_CHAT_ROUNDS}轮对话</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
                  onClick={handleClearChat}
                >
                  清空对话
                </button>
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  发送
                </button>
              </div>
            </div>
          </div>
        </form>
      </aside>
    </div>
  ) : null;

  if (isViewAll) {
    return (
      <>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <button className="hover:text-primary" onClick={onBack}>控制面板</button>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-200">查看所有物业</span>
          </div>
          <button
            className="text-sm font-semibold text-primary hover:underline"
            onClick={onBack}
          >
            返回概览
          </button>
        </div>
        <HotelGrid
          hotels={allHotels || []}
          loading={loading}
          onImageError={onImageError}
          onViewDetail={handleViewDetail}
        />
        {detailModal}
        {chatPanel}
      </>
    );
  }

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="总收藏量"
          value={error ? '--' : stats.totalFavorites}
          loading={loading}
          icon={(
            <svg className="h-5 w-5 text-rose-500" viewBox="0 0 24 24" fill="none">
              <path d="M12 20s-7-4.5-7-9.5A4.5 4.5 0 0 1 9.5 6c1.1 0 2.2.4 3 1.2A4.2 4.2 0 0 1 15.5 6 4.5 4.5 0 0 1 20 10.5C20 15.5 12 20 12 20Z" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          )}
        />
        <StatCard
          title="总预订"
          value={error ? '--' : stats.totalBookings}
          loading={loading}
          icon={(
            <svg className="h-5 w-5 text-indigo-500" viewBox="0 0 24 24" fill="none">
              <path d="M7 3v4M17 3v4M4 9h16M5 6h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8 13h4M8 17h7" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          )}
        />
        <StatCard
          title="总酒店数"
          value={error ? '--' : stats.totalHotels}
          loading={loading}
          icon={(
            <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 24 24" fill="none">
              <path d="M4 20V7l8-4 8 4v13H4Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          )}
        />
        <StatCard
          title="已发布"
          value={error ? '--' : stats.publishedHotels}
          loading={loading}
          icon={(
            <svg className="h-5 w-5 text-amber-500" viewBox="0 0 24 24" fill="none">
              <path d="M12 3 20 6v6c0 4.4-3 7.7-8 9-5-1.3-8-4.6-8-9V6l8-3Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          )}
        />
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">物业概览</h3>
          <button
            className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
            onClick={onViewAll}
          >
            查看所有物业
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>

        <HotelGrid
          hotels={previewHotels}
          loading={loading}
          onImageError={onImageError}
          onViewDetail={handleViewDetail}
        />
      </section>

      <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-3 rounded-full">
            <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none">
              <path d="M6 17h5l2 3h5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8 9h6M8 12h4" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">智能客服中心</p>
            <p className="text-xs text-slate-500">提供平台咨询、审核问题与账单支持的即时协助。</p>
          </div>
        </div>
        <div>
          <button
            className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
            onClick={handleOpenChat}
          >
            立即咨询
          </button>
        </div>
      </div>
      {detailModal}
      {chatPanel}
    </>
  );
}
