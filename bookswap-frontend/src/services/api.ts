// BookSwap - API servis katmanı
// Hafta 7: notificationService eklendi
// Gerçek telefon için bilgisayarın yerel IP adresi kullanılır

const BASE_URL = 'http://10.0.2.2:5000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

let authToken: string | null = null;

export const setToken = (token: string) => {
  authToken = token;
};

export const clearToken = () => {
  authToken = null;
};

async function post<T>(endpoint: string, body: object): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {'Content-Type': 'application/json'};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const json = await response.json();
    if (!response.ok) return {error: json.message || 'Bir hata oluştu.'};
    return {data: json as T};
  } catch (e) {
    return {error: 'Sunucuya bağlanılamadı.'};
  }
}

async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const response = await fetch(`${BASE_URL}${endpoint}`, {method: 'GET', headers});
    const json = await response.json();
    if (!response.ok) return {error: json.message || 'Bir hata oluştu.'};
    return {data: json as T};
  } catch (e) {
    return {error: 'Sunucuya bağlanılamadı.'};
  }
}

async function del<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const response = await fetch(`${BASE_URL}${endpoint}`, {method: 'DELETE', headers});
    if (!response.ok) {
      const json = await response.json();
      return {error: json.message || 'Bir hata oluştu.'};
    }
    return {data: {} as T};
  } catch (e) {
    return {error: 'Sunucuya bağlanılamadı.'};
  }
}

async function put<T>(endpoint: string, body?: object): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {'Content-Type': 'application/json'};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await response.json();
    if (!response.ok) return {error: json.message || 'Bir hata oluştu.'};
    return {data: json as T};
  } catch (e) {
    return {error: 'Sunucuya bağlanılamadı.'};
  }
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface AuthResult {
  token: string;
  name: string;
  email: string;
  userId: number;
}

export const authService = {
  login: (email: string, password: string) =>
    post<AuthResult>('/api/auth/login', {email, password}),
  register: (name: string, email: string, password: string) =>
    post<AuthResult>('/api/auth/register', {name, email, password}),
};

// ─── Books ───────────────────────────────────────────────────────────────────

export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  condition: string;
  description?: string;
  status: string;
  userId: number;
  userName?: string;
  createdAt: string;
}

export interface CreateBookData {
  title: string;
  author: string;
  category: string;
  condition: string;
  description?: string;
}

export interface SearchParams {
  q?: string;
  category?: string;
  condition?: string;
}

export const bookService = {
  getAll: () => get<Book[]>('/api/books'),
  getMy: () => get<Book[]>('/api/books/my'),
  getById: (id: number) => get<Book>(`/api/books/${id}`),
  search: (params: SearchParams) => {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.category) query.append('category', params.category);
    if (params.condition) query.append('condition', params.condition);
    return get<Book[]>(`/api/books/search?${query.toString()}`);
  },
  create: (data: CreateBookData) => post<Book>('/api/books', data),
  delete: (id: number) => del<{}>(`/api/books/${id}`),
};

// ─── Offers ──────────────────────────────────────────────────────────────────

export interface Offer {
  id: number;
  status: string; // Bekliyor, Kabul Edildi, Reddedildi
  createdAt: string;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  requestedBookId: number;
  requestedBookTitle: string;
  offeredBookId: number;
  offeredBookTitle: string;
}

export const offerService = {
  create: (requestedBookId: number, offeredBookId: number) =>
    post<Offer>('/api/offers', {requestedBookId, offeredBookId}),
  getIncoming: () => get<Offer[]>('/api/offers/incoming'),
  getOutgoing: () => get<Offer[]>('/api/offers/outgoing'),
  accept: (id: number) => put<{message: string}>(`/api/offers/${id}/accept`),
  reject: (id: number) => put<{message: string}>(`/api/offers/${id}/reject`),
};

// ─── Notifications (Hafta 7) ─────────────────────────────────────────────────

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string; // TeklifAlindi, TeklifKabul, TeklifRed
  offerId?: number;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  // Tüm bildirimler
  getAll: () => get<Notification[]>('/api/notifications'),

  // Okunmamış bildirim sayısı
  getUnreadCount: () => get<{count: number}>('/api/notifications/unread'),

  // Tek bildirimi okundu yap
  markRead: (id: number) => put<{message: string}>(`/api/notifications/${id}/read`),

  // Tüm bildirimleri okundu yap
  markAllRead: () => put<{message: string}>('/api/notifications/read-all'),
};
