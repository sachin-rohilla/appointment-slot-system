import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  signUp: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) => api.post("/auth/sign-up", data),
  signIn: (data: { email: string; password: string }) =>
    api.post("/auth/sign-in", data),
};

// Slots API
export const slotsAPI = {
  createSlot: (data: {
    resource: string;
    startTime: string;
    endTime: string;
  }) => api.post("/slots/create", data),
  getAllSlots: () => api.get("/slots/all-slot-list"),
  getDeletedSlots: () => api.get("/slots/deleted-slot-list"),
  updateSlot: (slotId: string) => api.patch(`/slots/update/${slotId}`),
  deleteSlots: (slotIds: string[]) =>
    api.delete("/slots/delete", { data: { slotIds } }),
  undoSlots: (slotIds: string[]) => api.patch("/slots/undo", { slotIds }),
};

// Bookings API
export const bookingsAPI = {
  createBooking: (slotId: string) => api.post("/bookings", { slotId }),
};
