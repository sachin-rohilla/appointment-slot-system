const API_BASE_URL = "http://localhost:5000/api/v1";

export interface PaginatedApiResponse<T = any> {
  success: boolean;
  data?: T[];
  page?: number;
  limit?: number;
  totalCount?: number;
  totalPages?: number;
  message?: string;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: "USER" | "ADMIN";
}

export interface Slot {
  id: string;
  resource: string;
  startTime: string;
  endTime: string;
  state: "available" | "held" | "booked";
  heldByUserId: string | null;
  heldUntil: string | null;
  createdAt: string;
  updatedAt: string;
  waitlist?: Array<{
    userId: string;
    slotId: string;
    position: number;
  }>;
}

export interface Booking {
  id: string;
  slotId: string;
  userId: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    console.log("Token from localStorage:", token); // Debug log
    return {
      "Content-Type": "application/json",
      ...(token &&
        token !== "undefined" && { Authorization: `Bearer ${token}` }),
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Auth endpoints
  async login(
    credentials: LoginCredentials,
  ): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.request("/auth/sign-in", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async signup(
    credentials: SignupCredentials,
  ): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.request("/auth/sign-up", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  // Slot endpoints
  async getAllSlots(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedApiResponse<Slot>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.request(`/slots/all-list?${params}`);
  }

  async getDeletedSlots(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedApiResponse<Slot>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = (await this.request(
      `/slots/deleted-list?${params}`,
    )) as any;
    // Handle nested data structure
    if (response.data?.data) {
      return {
        ...response,
        data: response.data.data,
      };
    }
    return response;
  }

  async createSlot(
    slotData: Omit<
      Slot,
      "id" | "createdAt" | "updatedAt" | "state" | "heldByUserId" | "heldUntil"
    >,
  ): Promise<ApiResponse<Slot>> {
    return this.request("/slots/create", {
      method: "POST",
      body: JSON.stringify(slotData),
    });
  }

  async deleteSlots(slotIds: string[]): Promise<ApiResponse> {
    return this.request("/slots/delete", {
      method: "DELETE",
      body: JSON.stringify({ slotIds }),
    });
  }

  async restoreSlots(slotIds: string[]): Promise<ApiResponse> {
    return this.request("/slots/restore", {
      method: "PATCH",
      body: JSON.stringify({ slotIds }),
    });
  }

  async holdSlot(slotId: string): Promise<ApiResponse<Slot>> {
    return this.request(`/slots/hold/${slotId}`, {
      method: "PATCH",
    });
  }

  // Booking endpoints
  async createBooking({
    slotId,
  }: {
    slotId: string;
  }): Promise<ApiResponse<Booking>> {
    return this.request("/bookings/create", {
      method: "POST",
      body: JSON.stringify({ slotId }),
    });
  }

  async cancelBooking(bookingId: string): Promise<ApiResponse> {
    return this.request(`/bookings/cancel/${bookingId}`, {
      method: "PATCH",
    });
  }

  async getUserBookings(): Promise<ApiResponse<Booking[]>> {
    return this.request("/bookings/user");
  }

  // Waitlist endpoints
  async joinWaitlist(slotId: string): Promise<ApiResponse> {
    return this.request("/waitlist/create", {
      method: "POST",
      body: JSON.stringify({ slotId }),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request("/health");
  }
}

export const apiClient = new ApiClient();
