const API_BASE_URL = "http://localhost:5000/api/v1";

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
  async getAllSlots(): Promise<ApiResponse<Slot[]>> {
    return this.request("/slots/all-list");
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

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request("/health");
  }
}

export const apiClient = new ApiClient();
