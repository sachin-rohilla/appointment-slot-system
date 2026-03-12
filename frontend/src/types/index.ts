export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface Slot {
  id: string;
  resource: string;
  startTime: string;
  endTime: string;
  state: "available" | "held" | "booked";
  isDeleted: boolean;
  heldByUserId?: string;
  heldUntil?: string;
  booking?: Booking;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  slotId: string;
  status: "confirmed" | "cancelled" | "expired";
  user: User;
  slot: Slot;
  createdAt: string;
  updatedAt: string;
}

export interface Waitlist {
  id: string;
  slotId: string;
  userId: string;
  position: number;
  slot: Slot;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
