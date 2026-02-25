const API_BASE = 'http://localhost:5050';

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, options);
  const result = await response.json();
  return { response, result };
};

const buildHeaders = (token, headers = {}) => {
  if (!token) {
    return { ...headers };
  }
  return { ...headers, Authorization: `Bearer ${token}` };
};

export const sendAuthCode = (phone, type) =>
  requestJson('/auth/send-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ phone, type })
  });

export const checkAccountAvailable = async (phone) => {
  try {
    const { result } = await requestJson('/auth/check-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone })
    });
    return Boolean(result?.data?.available);
  } catch (error) {
    return false;
  }
};

export const login = (payload) =>
  requestJson('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

export const register = (payload) =>
  requestJson('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

export const resetPassword = (payload) =>
  requestJson('/auth/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

export const fetchUserProfile = async (token) => {
  const { response, result } = await requestJson('/user/profile', {
    headers: buildHeaders(token)
  });
  if (!response.ok || result.code !== 0) {
    throw new Error(result.msg || '加载失败');
  }
  return result.data;
};

export const updateUserProfile = async ({ token, payload }) => {
  const { response, result } = await requestJson('/user/profile', {
    method: 'PUT',
    headers: buildHeaders(token, {
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(payload)
  });
  if (!response.ok || result.code !== 0) {
    throw new Error(result.msg || '修改失败');
  }
  return result.data;
};

export const fetchHotelPage = async ({ token, page, size, errorMessage = '加载失败' }) => {
  const { response, result } = await requestJson(`/hotel/list?page=${page}&size=${size}`, {
    headers: buildHeaders(token)
  });
  if (!response.ok || result.code !== 0) {
    throw new Error(result.msg || errorMessage);
  }
  return result.data;
};

export const fetchAllHotels = async ({ token, pageSize }) => {
  const firstPage = await fetchHotelPage({ token, page: 1, size: pageSize });
  const total = firstPage.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages === 1) {
    return { total, list: firstPage.list || [] };
  }
  const restPages = await Promise.all(
    Array.from({ length: totalPages - 1 }).map((_, index) =>
      fetchHotelPage({ token, page: index + 2, size: pageSize })
    )
  );
  const list = [firstPage.list || [], ...restPages.map((page) => page.list || [])].flat();
  return { total, list };
};

export const fetchHotelDetail = async ({ token, hotelId, errorMessage = '加载失败' }) => {
  const { response, result } = await requestJson(`/hotel/detail/${hotelId}`, {
    headers: buildHeaders(token)
  });
  if (!response.ok || result.code !== 0) {
    throw new Error(result.msg || errorMessage);
  }
  return result.data;
};

export const fetchHotelAuditStatus = async ({ token, hotelId }) => {
  const { response, result } = await requestJson(`/hotel/audit-status/${hotelId}`, {
    headers: buildHeaders(token)
  });
  if (!response.ok || result.code !== 0) {
    throw new Error(result.msg || '加载审核记录失败');
  }
  return Array.isArray(result.data) ? result.data : [];
};

export const deleteHotel = async ({ token, hotelId }) => {
  const { response, result } = await requestJson(`/hotel/delete/${hotelId}`, {
    method: 'DELETE',
    headers: buildHeaders(token)
  });
  if (!response.ok || result.code !== 0) {
    throw new Error(result.msg || '删除失败');
  }
  return result.data;
};

export const createHotel = ({ token, payload }) =>
  requestJson('/hotel/create', {
    method: 'POST',
    headers: buildHeaders(token, {
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(payload)
  });

export const updateHotel = ({ token, hotelId, payload }) =>
  requestJson(`/hotel/update/${hotelId}`, {
    method: 'PUT',
    headers: buildHeaders(token, {
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(payload)
  });

export const fetchMessages = async ({ token, page = 1 }) => {
  const { response, result } = await requestJson(`/user/messages?page=${page}`, {
    headers: buildHeaders(token)
  });
  if (!response.ok || result.code !== 0) {
    throw new Error(result.msg || '加载失败');
  }
  return result.data;
};

export const sendChatCompletions = ({ token, messages }) =>
  requestJson('/chat/completions', {
    method: 'POST',
    headers: buildHeaders(token, {
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({ messages })
  });

export const fetchAdminAuditList = async ({ token, status, page = 1, pageSize = 50 }) => {
  const { response, result } = await requestJson(
    `/admin/hotel/audit-list?page=${page}&page_size=${pageSize}&status=${status}`,
    {
      headers: buildHeaders(token)
    }
  );
  if (!response.ok || result.code !== 0) {
    throw new Error(result.msg || '加载失败');
  }
  return result.data;
};

export const fetchAdminHotelDetail = async ({ token, hotelId }) => {
  const { response, result } = await requestJson(`/admin/hotel/detail/${hotelId}`, {
    headers: buildHeaders(token)
  });
  if (!response.ok || result.code !== 0) {
    throw new Error(result.msg || '加载失败');
  }
  return result.data;
};

export const submitAdminHotelAudit = async ({ token, hotelIds, status, rejectReason }) => {
  const payload = {
    hotel_ids: hotelIds,
    status,
    reject_reason: status === 'rejected' ? rejectReason : undefined
  };
  const { response, result } = await requestJson('/admin/hotel/batch-audit', {
    method: 'POST',
    headers: buildHeaders(token, {
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(payload)
  });
  if (!response.ok || result.code !== 0) {
    throw new Error(result.msg || '操作失败');
  }
  return result.data;
};
