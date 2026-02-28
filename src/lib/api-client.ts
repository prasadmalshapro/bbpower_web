const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string | undefined) {
    if (!baseURL) {
      throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
    }
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: headers as HeadersInit,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((err: unknown) => {
            if (typeof err === 'object' && err !== null) {
              const errorObj = err as { msg?: string; message?: string };
              return errorObj.msg || errorObj.message || String(err);
            }
            return String(err);
          }).join(', ');
          return {
            error: errorMessages || data.error || data.message || 'An error occurred',
          };
        }
        return {
          error: data.error || data.message || 'An error occurred',
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth API methods
export const authApi = {
  register: (userData: {
    username: string;
    email: string;
    mobile: string;
    password: string;
    address?: string;
    role?: string;
  }) => apiClient.post('/auth/register', userData),

  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
};

// Stores API methods
export const storesApi = {
  getAll: (params?: { city?: string; status?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return apiClient.get(`/stores${query ? `?${query}` : ''}`);
  },
  getById: (id: number) => apiClient.get(`/stores/${id}`),
  create: (storeData: {
    name: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    provider_store_id?: string;
  }) => apiClient.post('/stores', storeData),
  update: (id: number, storeData: Record<string, unknown>) => apiClient.put(`/stores/${id}`, storeData),
  delete: (id: number) => apiClient.delete(`/stores/${id}`),
};

// Devices API methods
export const devicesApi = {
  getAll: (params?: { store_id?: number; status?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return apiClient.get(`/devices${query ? `?${query}` : ''}`);
  },
  getById: (id: number) => apiClient.get(`/devices/${id}`),
  create: (deviceData: {
    store_id: number;
    device_name: string;
    device_code: string;
    device_token?: string;
    number_of_power_banks?: number;
    status?: string;
  }) => apiClient.post('/devices', deviceData),
  update: (id: number, deviceData: Record<string, unknown>) => apiClient.put(`/devices/${id}`, deviceData),
  delete: (id: number) => apiClient.delete(`/devices/${id}`),
  /** Eject single power bank (slot 1-based). Command 65 */
  eject: (id: number, slot: number) => apiClient.post(`/devices/${id}/eject`, { slot }),
  /** Eject all power banks. Command 81 */
  ejectAll: (id: number) => apiClient.post(`/devices/${id}/eject-all`),
};

// Users API methods
export const usersApi = {
  getAll: (params?: { role?: string; status?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return apiClient.get(`/users${query ? `?${query}` : ''}`);
  },
  getById: (id: number) => apiClient.get(`/users/${id}`),
  create: (userData: {
    username: string;
    email: string;
    mobile: string;
    password: string;
    role?: string;
    status?: string;
  }) => apiClient.post('/users', userData),
  update: (id: number, userData: Record<string, unknown>) => apiClient.put(`/users/${id}`, userData),
  delete: (id: number) => apiClient.delete(`/users/${id}`),
};

// QR Codes API methods
export const qrCodesApi = {
  getAll: (params?: { device_id?: number; is_active?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return apiClient.get(`/qr-codes${query ? `?${query}` : ''}`);
  },
  getById: (id: number) => apiClient.get(`/qr-codes/${id}`),
  scan: (code: string) => apiClient.get(`/qr-codes/scan/${encodeURIComponent(code)}`),
  generate: (deviceId: number) => apiClient.post('/qr-codes', { device_id: deviceId }),
  update: (id: number, data: { is_active?: boolean }) => apiClient.put(`/qr-codes/${id}`, data),
  delete: (id: number) => apiClient.delete(`/qr-codes/${id}`),
};

// Rate Cards API methods
export const rateCardsApi = {
  getActive: () => apiClient.get('/rate-cards/active'),
  getAll: () => apiClient.get('/rate-cards'),
  create: (rateCardData: {
    first_duration_minutes: number;
    first_amount: number;
    subsequent_duration_minutes: number;
    subsequent_amount: number;
    refundable_deposit: number;
  }) => apiClient.post('/rate-cards', rateCardData),
  update: (id: number, rateCardData: Record<string, unknown>) => apiClient.put(`/rate-cards/${id}`, rateCardData),
};

// Commissions API methods
export const commissionsApi = {
  getAll: () => apiClient.get('/commissions'),
  getById: (id: number) => apiClient.get(`/commissions/${id}`),
  getByStore: (storeId: number) => apiClient.get(`/commissions/store/${storeId}`),
  create: (commissionData: {
    store_id: number;
    commission_percentage: number;
    store_share: number;
    company_share: number;
  }) => apiClient.post('/commissions', commissionData),
  update: (id: number, commissionData: Record<string, unknown>) => apiClient.put(`/commissions/${id}`, commissionData),
};

// Store-User Mapping API methods
export const storeUsersApi = {
  mapUserToStore: (data: { user_id: number; store_id: number; role?: string }) =>
    apiClient.post('/store-users', data),
  getStoresByUser: (userId: number) => apiClient.get(`/store-users/user/${userId}`),
  getUsersByStore: (storeId: number) => apiClient.get(`/store-users/store/${storeId}`),
  removeUserFromStore: (userId: number, storeId: number) =>
    apiClient.delete(`/store-users/user/${userId}/store/${storeId}`),
};

// Rental API methods
export const rentalsApi = {
  startRental: (data: { qr_code: string }) => apiClient.post('/rentals', data),
  startRentalNoPayment: (data: { qr_code: string }) => apiClient.post('/rentals/start-no-payment', data),
  startRentalAfterPayment: (data: { qr_code: string; payment_local_id: string; genie_transaction_id: string }) =>
    apiClient.post('/rentals/after-payment', data),
  endRental: (rentalId: number) => apiClient.put(`/rentals/${rentalId}/end`),
  getActiveRental: () => apiClient.get('/rentals/active'),
  getRentalHistory: () => apiClient.get('/rentals/history'),
};

// Disputes / Reported issues (admin: list all and update)
export const disputesApi = {
  getAll: (params?: { status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set('status', params.status);
    const query = queryParams.toString();
    return apiClient.get(`/rentals/disputes/all${query ? `?${query}` : ''}`);
  },
  update: (id: number, data: { status?: string; admin_notes?: string }) =>
    apiClient.patch(`/rentals/disputes/${id}`, data),
};

// Payment API methods
export const paymentsApi = {
  getPaymentHistory: () => apiClient.get('/payments'),
  getPayment: (id: number) => apiClient.get(`/payments/${id}`),
  calculateRentalPayment: (qrCode: string) => apiClient.get(`/payments/calculate-rental?qr_code=${encodeURIComponent(qrCode)}`),
  createPayment: (paymentData: Record<string, unknown>) => apiClient.post('/payments/create', paymentData),
  initPayment: (data: { amount: number; localid: string; response?: string; remarks?: string }) => 
    apiClient.post('/payments/init', data),
  completePayment: (data: { localid: string; response: string }) => 
    apiClient.post('/payments/complete', data),
  refundPayment: (data: { transactionId: string; refundAmount: number; refundReason: string }) =>
    apiClient.post('/payments/refund', data),
};

// Wallet API methods
export const walletApi = {
  getWallet: () => apiClient.get('/wallet'),
  topUp: (data: { amount: number; payment_gateway_ref?: string }) =>
    apiClient.post('/wallet/top-up', data),
  getTransactions: () => apiClient.get('/wallet/transactions'),
};

// Notification API methods
export const notificationsApi = {
  getAll: (params?: {
    search?: string;
    type?: string;
    entity_type?: string;
    is_read?: boolean | number;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return apiClient.get(`/notifications${query ? `?${query}` : ''}`);
  },
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
  markAsRead: (id: number) => apiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put('/notifications/read-all'),
};

// Profile API methods
export const profileApi = {
  getProfile: () => apiClient.get('/profile'),
  updateProfile: (data: {
    username?: string;
    email?: string;
    mobile?: string;
    address?: string;
    password?: string;
  }) => apiClient.put('/profile', data),
};

// Tips API methods (admin CRUD; public GET used by app)
export const tipsApi = {
  getAll: () => apiClient.get('/tips/list'),
  getTips: (params?: { category?: string; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.set('category', params.category);
    if (params?.limit != null) queryParams.set('limit', String(params.limit));
    const query = queryParams.toString();
    return apiClient.get(`/tips${query ? `?${query}` : ''}`);
  },
  getTip: (id: number) => apiClient.get(`/tips/${id}`),
  create: (data: {
    title: string;
    description: string;
    category?: string;
    icon?: string | null;
    display_order?: number;
    is_active?: boolean;
  }) => apiClient.post('/tips', data),
  update: (id: number, data: Record<string, unknown>) => apiClient.put(`/tips/${id}`, data),
  delete: (id: number) => apiClient.delete(`/tips/${id}`),
};

// Special Offers API methods (public getActive for app; admin CRUD)
export const specialOffersApi = {
  getActive: () => apiClient.get('/special-offers/active'),
  getAll: () => apiClient.get('/special-offers'),
  create: (data: {
    label?: string;
    title: string;
    subtitle?: string | null;
    is_active?: boolean;
    display_order?: number;
  }) => apiClient.post('/special-offers', data),
  update: (id: number, data: Record<string, unknown>) => apiClient.put(`/special-offers/${id}`, data),
  delete: (id: number) => apiClient.delete(`/special-offers/${id}`),
};

// Stores with devices (for customers)
export const storesWithDevicesApi = {
  getStoresWithDevices: () => apiClient.get('/stores/with-devices'),
};

// Payment Gateway API methods
export const paymentGatewayApi = {
  initiatePayment: (data: {
    amount: number;
    rental_id?: number;
    description?: string;
  }) => apiClient.post('/payment-gateway/initiate', data),
  verifyPayment: (paymentRef: string) =>
    apiClient.get(`/payment-gateway/verify/${paymentRef}`),
  processRefund: (data: { payment_ref: string; amount: number }) =>
    apiClient.post('/payment-gateway/refund', data),
};

export default apiClient;
