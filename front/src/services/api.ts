const API_BASE = import.meta.env.VITE_API_BASE || undefined;

let accessToken: string | null = localStorage.getItem('accessToken');
let refreshToken: string | null = localStorage.getItem('refreshToken');

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function getAccessToken() {
  return accessToken;
}

// API request helper with automatic token refresh
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  if(!API_BASE) {
    throw new Error('API_BASE is not defined');
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // If unauthorized and we have a refresh token, try to refresh
  if (response.status === 401 && refreshToken) {
    try {
      const refreshResponse = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setTokens(data.token, data.refreshToken);
        
        // Retry original request with new token
        headers['Authorization'] = `Bearer ${data.token}`;
        response = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers,
        });
      } else {
        // Refresh failed, clear tokens
        clearTokens();
        window.location.href = '/login';
      }
    } catch (error) {
      clearTokens();
      window.location.href = '/login';
    }
  }

  const contentType = response.headers.get('Content-Type');
  const isJson = contentType && contentType.includes('application/json');
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof body === 'string'
      ? body
      : body?.error || `HTTP ${response.status}: Request failed`;
    throw new Error(message);
  }

  return body;
}

// Authentication API
export const authAPI = {
  async register(email: string, userName: string, password: string) {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, userName, password }),
    });
  },

  async verifyEmail(email: string, code: string) {
    return apiRequest('/api/auth/register/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  async resendVerification(email: string) {
    return apiRequest('/api/auth/register/resend', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async login(email: string, password: string) {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token && data.refreshToken) {
      setTokens(data.token, data.refreshToken);
    }
    
    return data;
  },

  async logout() {
    if (refreshToken) {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    }
    clearTokens();
  },

  async getMe() {
    return apiRequest('/api/auth/me');
  },

  async requestPasswordReset(email: string) {
    return apiRequest('/api/auth/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string) {
    return apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },
};

// Chats API
export const chatsAPI = {
  async list() {
    return apiRequest('/api/chats');
  },

  async get(chatId: string) {
    return apiRequest(`/api/chats/${chatId}`);
  },

  async create(title: string) {
    return apiRequest('/api/chats', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  async update(chatId: string, data: { title?: string; isPinned?: boolean }) {
    return apiRequest(`/api/chats/${chatId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(chatId: string) {
    return apiRequest(`/api/chats/${chatId}`, {
      method: 'DELETE',
    });
  },

  async addMessage(chatId: string, role: 'user' | 'assistant', content: string) {
    return apiRequest(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ role, content }),
    });
  },
};

// Admin API
export const adminAPI = {
  getStats: () => apiRequest('/api/admin/stats'),
  getUsers: () => apiRequest('/api/admin/users'),
  getUserDetails: (userId: string) => apiRequest(`/api/admin/users/${userId}`),
  updateUserRoles: (userId: string, roles: string[]) => 
    apiRequest(`/api/admin/users/${userId}/roles`, {
      method: 'PUT',
      body: JSON.stringify({ roles })
    }),
  toggleUserStatus: (userId: string) =>
    apiRequest(`/api/admin/users/${userId}/toggle-status`, { method: 'PATCH' }),
  deleteUser: (userId: string) =>
    apiRequest(`/api/admin/users/${userId}`, { method: 'DELETE' })
};

// Standalone exports for password reset
export async function requestPasswordReset(email: string) {
  return authAPI.requestPasswordReset(email);
}

export async function resetPassword(token: string, newPassword: string) {
  return authAPI.resetPassword(token, newPassword);
}