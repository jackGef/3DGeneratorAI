const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8081';

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

// Jobs API
export const jobsAPI = {
  async list() {
    return apiRequest('/api/jobs');
  },

  async create(prompt: string, params: any = {}) {
    return apiRequest('/api/jobs', {
      method: 'POST',
      body: JSON.stringify({ prompt, params }),
    });
  },

  async cancel(jobId: string) {
    return apiRequest(`/api/jobs/${jobId}/cancel`, {
      method: 'POST',
    });
  },
};

// Assets API
export const assetsAPI = {
  async list(jobId?: string) {
    const query = jobId ? `?jobId=${jobId}` : '';
    return apiRequest(`/api/assets${query}`);
  },
};

// Chats API
export const chatsAPI = {
  async list() {
    return apiRequest('/api/chats');
  },

  async create(title: string) {
    return apiRequest('/api/chats', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  async update(chatId: string, title: string) {
    return apiRequest(`/api/chats/${chatId}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
  },

  async delete(chatId: string) {
    return apiRequest(`/api/chats/${chatId}`, {
      method: 'DELETE',
    });
  },
};

// Messages API
export const messagesAPI = {
  async list(chatId: string, page = 1, limit = 50) {
    return apiRequest(`/api/messages?chatId=${chatId}&page=${page}&limit=${limit}`);
  },

  async send(chatId: string, role: 'user' | 'assistant', content: string, type: 'text' | 'image' | 'model' = 'text', attachments?: any[]) {
    return apiRequest('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ chatId, role, content, type, attachments }),
    });
  },
};

// Analytics API
export const analyticsAPI = {
  async getStats() {
    return apiRequest('/api/analytics/stats');
  },

  async getDashboard(days = 30) {
    return apiRequest(`/api/analytics/dashboard?days=${days}`);
  },

  async getGenerationMetrics(days = 30) {
    return apiRequest(`/api/analytics/generation-metrics?days=${days}`);
  },

  async getPopularPrompts(limit = 10) {
    return apiRequest(`/api/analytics/popular-prompts?limit=${limit}`);
  },

  async getChatStats() {
    return apiRequest('/api/analytics/chat-stats');
  },
};

// Generate API (simplified for backward compatibility)
export async function generate({ prompt, guidanceScale = 15.0, steps = 64, frameSize = 256 }: 
  { prompt: string; guidanceScale?: number; steps?: number; frameSize?: number }) {
  return apiRequest('/api/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt, guidanceScale, steps, frameSize }),
  });
}