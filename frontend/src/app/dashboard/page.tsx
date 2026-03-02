"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, Slot, Booking } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
} from "lucide-react";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isCreateSlotDialogOpen, setIsCreateSlotDialogOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    resource: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchSlots();
      fetchBookings();
    }
  }, [isAuthenticated]);

  // Auto-refresh slots every 30 seconds to update hold status
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchSlots();
      fetchBookings();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchSlots = async () => {
    try {
      const response = await apiClient.getAllSlots();
      if (response.success && response.data) {
        setSlots(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch slots:", error);
    } finally {
      setSlotsLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await apiClient.getUserBookings();
      if (response.success && response.data) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleHoldSlot = async () => {
    if (!selectedSlot) return;

    try {
      console.log(
        "Attempting to hold slot:",
        selectedSlot.id,
        "User:",
        user?.id,
      );

      const response = await apiClient.holdSlot(selectedSlot.id);

      console.log("Hold response:", response);

      if (response.success) {
        setIsBookingDialogOpen(false);
        setSuccess("Slot held successfully! You can now book it.");
        setError("");
        fetchSlots(); // Refresh slots
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.error || "Failed to hold slot");
        setSuccess("");
      }
    } catch (error: unknown) {
      console.error("Hold slot error:", error);
      setError(error instanceof Error ? error.message : "Failed to hold slot");
      setSuccess("");
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) return;

    try {
      console.log(
        "Attempting to book slot:",
        selectedSlot.id,
        "User:",
        user?.id,
      );
      console.log(
        "Slot state:",
        selectedSlot.state,
        "Held by:",
        selectedSlot.heldByUserId,
      );
      console.log("Hold until:", selectedSlot.heldUntil);

      // Check if hold is still valid
      if (selectedSlot.heldUntil) {
        const holdExpiry = new Date(selectedSlot.heldUntil);
        const now = new Date();
        if (holdExpiry < now) {
          setError("Hold has expired. Please hold the slot again.");
          setSuccess("");
          fetchSlots(); // Refresh to show current state
          return;
        }
      }

      const response = await apiClient.createBooking({
        slotId: selectedSlot.id,
      });

      console.log("Booking response:", response);

      if (response.success) {
        setIsBookingDialogOpen(false);
        setSelectedSlot(null);
        setSuccess("Booking created successfully!");
        setError("");
        fetchSlots(); // Refresh slots
        fetchBookings(); // Refresh bookings
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.error || "Failed to create booking");
        setSuccess("");
      }
    } catch (error: unknown) {
      console.error("Booking error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create booking",
      );
      setSuccess("");
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await apiClient.cancelBooking(bookingId);

      if (response.success) {
        setSuccess("Booking cancelled successfully!");
        setError("");
        fetchSlots(); // Refresh slots
        fetchBookings(); // Refresh bookings
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.error || "Failed to cancel booking");
        setSuccess("");
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Failed to cancel booking",
      );
      setSuccess("");
    }
  };

  const handleCreateSlot = async () => {
    try {
      // Convert date and time to ISO datetime format
      const startDateTime = new Date(`${newSlot.date}T${newSlot.startTime}:00`);
      const endDateTime = new Date(`${newSlot.date}T${newSlot.endTime}:00`);

      const slotData = {
        resource: newSlot.resource || "General Consultation",
        date: newSlot.date,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      };

      const response = await apiClient.createSlot(slotData);
      console.log("Create slot response:", response); // Debug log

      if (response.success) {
        setIsCreateSlotDialogOpen(false);
        setNewSlot({ resource: "", date: "", startTime: "", endTime: "" });
        setSuccess("Slot created successfully!");
        setError("");
        fetchSlots(); // Refresh slots
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.error || "Failed to create slot");
        setSuccess("");
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Failed to create slot",
      );
      setSuccess("");
      console.error("Failed to create slot:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const isSlotAvailable = (slot: Slot) => {
    return slot.state === "available";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            Please login to access dashboard
          </p>
          <Link href="/auth/login">
            <Button className="mt-4">Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-light text-gray-900 tracking-tight">
                Welcome back, {user?.name}
              </h1>
              <p className="text-gray-600 mt-2 font-light">
                Manage your appointment slots
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div
                className={`px-4 py-2 rounded-full border text-sm font-medium ${
                  user?.role === "ADMIN"
                    ? "bg-black text-white border-black"
                    : "bg-gray-100 text-gray-700 border-gray-300"
                }`}
              >
                {user?.role === "ADMIN" ? "Admin" : "User"}
              </div>
              <button
                onClick={() => (window.location.href = "/auth/login")}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error and Success Messages */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-900">Success</p>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
            <button
              onClick={() => setSuccess("")}
              className="ml-auto text-green-400 hover:text-green-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Admin Create Slot Section */}
        {user?.role === "ADMIN" && (
          <div className="mb-12">
            <Dialog
              open={isCreateSlotDialogOpen}
              onOpenChange={setIsCreateSlotDialogOpen}
            >
              <DialogTrigger asChild>
                <button className="bg-black text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Create New Slot
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg border border-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-light text-gray-900">
                    Create New Slot
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 font-light">
                    Add a new appointment slot for booking
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="resource"
                      className="text-sm font-medium text-gray-700"
                    >
                      Resource Type
                    </Label>
                    <Input
                      id="resource"
                      type="text"
                      placeholder="e.g., General Consultation"
                      value={newSlot.resource}
                      onChange={(e) =>
                        setNewSlot({ ...newSlot, resource: e.target.value })
                      }
                      className="border-gray-300 rounded-lg focus:border-black focus:ring-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="date"
                      className="text-sm font-medium text-gray-700"
                    >
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={newSlot.date}
                      onChange={(e) =>
                        setNewSlot({ ...newSlot, date: e.target.value })
                      }
                      className="border-gray-300 rounded-lg focus:border-black focus:ring-black"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="startTime"
                        className="text-sm font-medium text-gray-700"
                      >
                        Start Time
                      </Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={newSlot.startTime}
                        onChange={(e) =>
                          setNewSlot({ ...newSlot, startTime: e.target.value })
                        }
                        className="border-gray-300 rounded-lg focus:border-black focus:ring-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="endTime"
                        className="text-sm font-medium text-gray-700"
                      >
                        End Time
                      </Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={newSlot.endTime}
                        onChange={(e) =>
                          setNewSlot({ ...newSlot, endTime: e.target.value })
                        }
                        className="border-gray-300 rounded-lg focus:border-black focus:ring-black"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCreateSlot}
                    className="w-full bg-black text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Create Slot
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* User Bookings Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-gray-900">My Bookings</h2>
            <button
              onClick={() => {
                fetchSlots();
                fetchBookings();
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {bookingsLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-light">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-3">
                No bookings found
              </h3>
              <p className="text-gray-600 mb-6 font-light">
                You haven&apos;t made any bookings yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === "confirmed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : booking.status === "cancelled"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </div>
                        <span className="text-sm text-gray-500">
                          Booking ID: {booking.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-medium">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                        <span>
                          {new Date(booking.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="px-4 py-2 border border-red-300 rounded-full text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {slotsLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-light">Loading slots...</p>
          </div>
        ) : (
          <>
            {/* Slots Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {/* Slot Header */}
                  <div className="border-b border-gray-100 px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <h3 className="text-xl font-light text-gray-900">
                            {formatDate(slot.startTime)}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 font-light">
                            {formatTime(slot.startTime)} -{" "}
                            {formatTime(slot.endTime)}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${
                          isSlotAvailable(slot)
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : slot.state === "held"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isSlotAvailable(slot)
                              ? "bg-emerald-500"
                              : slot.state === "held"
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                        />
                        {isSlotAvailable(slot)
                          ? "Available"
                          : slot.state === "held"
                            ? "On Hold"
                            : "Booked"}
                      </div>
                    </div>
                  </div>

                  {/* Slot Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Resource
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {slot.resource}
                        </p>
                      </div>
                    </div>

                    {isSlotAvailable(slot) ? (
                      <Dialog
                        open={
                          isBookingDialogOpen && selectedSlot?.id === slot.id
                        }
                        onOpenChange={setIsBookingDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <button
                            onClick={() => setSelectedSlot(slot)}
                            className="w-full bg-emerald-600 text-white py-3 rounded-full text-sm font-medium hover:bg-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                          >
                            <Calendar className="w-4 h-4" />
                            Hold Slot
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md border border-gray-200">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-light text-gray-900">
                              Hold Slot
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 font-light">
                              Hold this slot for 15 minutes to complete your
                              booking
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-amber-600" />
                                <p className="text-sm font-medium text-amber-800">
                                  Important: Hold expires in 15 minutes
                                </p>
                              </div>
                              <p className="text-xs text-amber-700">
                                You must complete your booking within 15 minutes
                                of holding this slot.
                              </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-5 space-y-3">
                              <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">
                                  <strong>Date:</strong>{" "}
                                  {formatDate(slot.startTime)}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">
                                  <strong>Time:</strong>{" "}
                                  {formatTime(slot.startTime)} -{" "}
                                  {formatTime(slot.endTime)}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">
                                  <strong>Resource:</strong> {slot.resource}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={handleHoldSlot}
                                className="flex-1 bg-emerald-600 text-white py-3 rounded-full text-sm font-medium hover:bg-emerald-700 transition-colors"
                              >
                                Hold Slot
                              </button>
                              <button
                                onClick={() => setIsBookingDialogOpen(false)}
                                className="flex-1 border border-gray-300 py-3 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : slot.state === "held" &&
                      slot.heldByUserId === user?.id ? (
                      <Dialog
                        open={
                          isBookingDialogOpen && selectedSlot?.id === slot.id
                        }
                        onOpenChange={setIsBookingDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <button
                            onClick={() => setSelectedSlot(slot)}
                            className="w-full bg-blue-600 text-white py-3 rounded-full text-sm font-medium hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                          >
                            <Calendar className="w-4 h-4" />
                            Book Slot
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md border border-gray-200">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-light text-gray-900">
                              Confirm Booking
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 font-light">
                              Complete your booking for this held slot
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="bg-gray-50 rounded-lg p-5 space-y-3">
                              <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">
                                  <strong>Date:</strong>{" "}
                                  {formatDate(slot.startTime)}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">
                                  <strong>Time:</strong>{" "}
                                  {formatTime(slot.startTime)} -{" "}
                                  {formatTime(slot.endTime)}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">
                                  <strong>Resource:</strong> {slot.resource}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={handleBooking}
                                className="flex-1 bg-emerald-600 text-white py-3 rounded-full text-sm font-medium hover:bg-emerald-700 transition-colors"
                              >
                                Confirm Booking
                              </button>
                              <button
                                onClick={() => setIsBookingDialogOpen(false)}
                                className="flex-1 border border-gray-300 py-3 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <div className="text-center py-4">
                        <div
                          className={`inline-flex items-center gap-3 px-4 py-3 rounded-lg ${
                            slot.state === "held"
                              ? "bg-amber-50 border border-amber-200"
                              : "bg-red-50 border border-red-200"
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full ${
                              slot.state === "held"
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                          />
                          <div className="text-left">
                            <p
                              className={`text-sm font-medium ${
                                slot.state === "held"
                                  ? "text-amber-700"
                                  : "text-red-700"
                              }`}
                            >
                              {slot.state === "held" ? "On Hold" : "Booked"}
                            </p>
                            {slot.heldByUserId && (
                              <p
                                className={`text-xs mt-1 ${
                                  slot.state === "held"
                                    ? "text-amber-600"
                                    : "text-red-600"
                                }`}
                              >
                                Held by: {slot.heldByUserId}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {!slotsLoading && slots.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-light text-gray-900 mb-3">
                  No slots available
                </h3>
                <p className="text-gray-600 mb-6 font-light">
                  {user?.role === "ADMIN"
                    ? "Create a new slot to get started"
                    : "Check back later for available slots"}
                </p>
                {user?.role === "ADMIN" && (
                  <button
                    onClick={() => setIsCreateSlotDialogOpen(true)}
                    className="bg-black text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Create Your First Slot
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
