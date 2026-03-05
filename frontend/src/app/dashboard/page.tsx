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
  Trash2,
  Archive,
  CheckSquare,
  Square,
  RotateCcw,
  CalendarDays,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Timer,
  Sparkles,
  Zap,
  Crown,
  Gem,
  Star,
  Heart,
  Gift,
  PartyPopper,
  Confetti,
  Flame,
  Trophy,
  Target,
  Rocket,
  Smile,
  Frown,
  Meh,
  Laugh,
  Sun,
  Moon,
  Cloud,
  Coffee,
  Cake,
  Music,
  Camera,
  Palette,
  Brush,
  Wand2,
  Search,
} from "lucide-react";

// Pagination Component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  limit,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  limit: number;
}) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, totalCount);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">{startIndex}</span> to{" "}
        <span className="font-medium">{endIndex}</span> of{" "}
        <span className="font-medium">{totalCount}</span> results
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex items-center gap-1">
          {startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                1
              </button>
              {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                page === currentPage
                  ? "bg-black text-white border-black"
                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Helper function to check if hold is still valid
const isHoldValid = (heldUntil: string | null | undefined) => {
  if (!heldUntil) return false;
  return new Date(heldUntil).getTime() > new Date().getTime();
};

// Countdown Timer Component
const CountdownTimer = ({
  expiryTime,
  onExpire,
  className = "",
}: {
  expiryTime: string;
  onExpire?: () => void;
  className?: string;
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiryTime).getTime();
      const difference = expiry - now;

      if (difference > 0) {
        setTimeLeft(Math.floor(difference / 1000));
        setIsExpired(false);
      } else {
        setTimeLeft(0);
        setIsExpired(true);
        if (onExpire) {
          onExpire();
        }
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiryTime, onExpire]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isExpired) {
    return (
      <span className={`text-red-600 font-medium ${className}`}>Expired</span>
    );
  }

  return (
    <span className={`text-amber-600 font-medium ${className}`}>
      {formatTime(timeLeft)}
    </span>
  );
};

// Tab Components
const SlotsTab = ({
  slots,
  slotsLoading,
  selectedSlot,
  setSelectedSlot,
  isBookingDialogOpen,
  setIsBookingDialogOpen,
  selectedSlots,
  setSelectedSlots,
  showDeleteConfirm,
  setShowDeleteConfirm,
  isDeleting,
  user,
  formatDate,
  formatTime,
  isSlotAvailable,
  handleHoldSlot,
  handleBooking,
  handleDeleteSlots,
  toggleSlotSelection,
  toggleAllSlotsSelection,
  newSlot,
  setNewSlot,
  handleCreateSlot,
}: any) => {
  const [isCreateSlotDialogOpenLocal, setIsCreateSlotDialogOpenLocal] =
    useState(false);

  const handleCreateSlotDialogOpen = (open: boolean) => {
    setIsCreateSlotDialogOpenLocal(open);
  };

  return (
    <div className="space-y-8">
      {/* Admin Create Slot Section */}
      {user?.role === "ADMIN" && (
        <div className="mb-8">
          <Dialog
            open={isCreateSlotDialogOpenLocal}
            onOpenChange={handleCreateSlotDialogOpen}
          >
            <DialogTrigger asChild>
              <button className="bg-black text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
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

      {/* Admin Selection Controls */}
      {user?.role === "ADMIN" && slots.length > 0 && (
        <div className="mb-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAllSlotsSelection}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              {selectedSlots.length === slots.length ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
              Select All ({slots.length})
            </button>
            {selectedSlots.length > 0 && (
              <span className="text-sm text-gray-500">
                {selectedSlots.length} of {slots.length} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {selectedSlots.length > 0 && (
              <>
                <button
                  onClick={handleDeleteSlots}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedSlots.length})
                </button>
                <button
                  onClick={() => setSelectedSlots([])}
                  className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Clear Selection
                </button>
              </>
            )}
            <div className="text-xs text-gray-500">
              Admin: Select slots to delete
            </div>
          </div>
        </div>
      )}

      {/* Slots Grid */}
      {slotsLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-light">Loading slots...</p>
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full animate-pulse"></div>
            <Calendar className="w-12 h-12 text-gray-400 relative z-10" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
            {user?.role === "ADMIN" ? (
              <>
                <Sparkles className="w-6 h-6 text-yellow-500" />
                No Slots Available Yet
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </>
            ) : (
              <>
                <Search className="w-6 h-6 text-blue-500" />
                No Slots Available
                <Search className="w-6 h-6 text-blue-500" />
              </>
            )}
          </h3>
          <p className="text-gray-600 mb-8 text-lg font-medium">
            {user?.role === "ADMIN"
              ? "🎨 Create your first slot to start booking appointments"
              : "📅 Check back later for available appointment slots"}
          </p>
          {user?.role === "ADMIN" && (
            <button
              onClick={() => setIsCreateSlotDialogOpenLocal(true)}
              className="bg-gradient-to-r from-black to-gray-800 text-white px-10 py-4 rounded-2xl text-sm font-semibold hover:from-gray-800 hover:to-black transition-all duration-300 flex items-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 mx-auto"
            >
              <div className="p-2 bg-white/20 rounded-lg">
                <Plus className="w-5 h-5" />
              </div>
              <span>✨ Create Your First Slot</span>
              <Rocket className="w-5 h-5 opacity-70" />
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot: any) => (
            <div
              key={slot.id}
              className={`group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-102 ${selectedSlots.includes(slot.id) ? "ring-2 ring-blue-500 ring-offset-2" : slot.state === "expired" ? "opacity-75 border-orange-200" : ""}`}
            >
              {/* Status Badge */}
              <div className="absolute top-3 right-3 z-10">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 shadow-sm ${isSlotAvailable(slot) ? "bg-emerald-50 text-emerald-700 border-emerald-200" : slot.state === "held" ? (slot.heldByUserId === user?.id ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-700 border-gray-200") : slot.state === "expired" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-red-50 text-red-700 border-red-200"}`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${isSlotAvailable(slot) ? "bg-emerald-500" : slot.state === "held" ? (slot.heldByUserId === user?.id ? "bg-blue-500" : "bg-gray-500") : slot.state === "expired" ? "bg-orange-500" : "bg-red-500"}`}
                  />
                  {isSlotAvailable(slot)
                    ? "Available"
                    : slot.state === "held"
                      ? slot.heldByUserId === user?.id
                        ? "Your Hold"
                        : "On Hold"
                      : slot.state === "expired"
                        ? "Expired"
                        : "Booked"}
                </div>
              </div>

              {/* Card Header */}
              <div className="border-b border-gray-100 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {user?.role === "ADMIN" && (
                      <button
                        onClick={() => toggleSlotSelection(slot.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {selectedSlots.includes(slot.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900">
                          {formatDate(slot.startTime)}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatTime(slot.startTime)} -{" "}
                          {formatTime(slot.endTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5">
                {/* Resource Section */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                      Resource
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {slot.resource}
                    </p>
                  </div>
                </div>
                {isSlotAvailable(slot) ? (
                  <Dialog
                    open={isBookingDialogOpen && selectedSlot?.id === slot.id}
                    onOpenChange={setIsBookingDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <button
                        onClick={() => setSelectedSlot(slot)}
                        className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-md"
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
                          Hold this slot for 5 minutes to complete your booking
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <p className="text-sm font-medium text-amber-800">
                              Important: Hold expires in 5 minutes
                            </p>
                          </div>
                          <p className="text-xs text-amber-700">
                            You must complete your booking within 5 minutes of
                            holding this slot. The slot will be released
                            automatically if not booked in time.
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
                  slot.heldByUserId === user?.id &&
                  isHoldValid(slot.heldUntil) ? (
                  <Dialog
                    open={isBookingDialogOpen && selectedSlot?.id === slot.id}
                    onOpenChange={setIsBookingDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <button
                        onClick={() => setSelectedSlot(slot)}
                        className={`w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md ${
                          slot.heldUntil &&
                          new Date(slot.heldUntil).getTime() -
                            new Date().getTime() <
                            300000
                            ? "ring-2 ring-blue-300 ring-offset-2"
                            : ""
                        }`}
                      >
                        <Calendar className="w-4 h-4" />
                        Book Slot
                        {slot.heldUntil && (
                          <CountdownTimer
                            expiryTime={slot.heldUntil}
                            className="text-xs bg-blue-700 px-2 py-1 rounded-full"
                          />
                        )}
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
                        {slot.heldUntil && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Timer className="w-4 h-4 text-amber-600" />
                              <p className="text-sm font-medium text-amber-800">
                                Hold expires in:{" "}
                                <CountdownTimer expiryTime={slot.heldUntil} />
                              </p>
                            </div>
                            <p className="text-xs text-amber-700">
                              Complete your booking before the hold expires
                            </p>
                          </div>
                        )}
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
                      className={`inline-flex items-center gap-3 px-4 py-3 rounded-lg ${slot.state === "held" ? "bg-gray-50 border border-gray-200" : slot.state === "expired" ? "bg-orange-50 border border-orange-200" : "bg-red-50 border border-red-200"}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${slot.state === "held" ? "bg-gray-400" : slot.state === "expired" ? "bg-orange-400" : "bg-red-400"}`}
                      />
                      <div className="text-left">
                        <p
                          className={`text-sm font-medium ${slot.state === "held" ? "text-gray-700" : slot.state === "expired" ? "text-orange-700" : "text-red-700"}`}
                        >
                          {slot.state === "held"
                            ? "On Hold"
                            : slot.state === "expired"
                              ? "Expired"
                              : "Booked"}
                        </p>
                        {slot.state === "held" && slot.heldUntil && (
                          <p className="text-xs mt-1 text-gray-600 flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            Expires:{" "}
                            <CountdownTimer expiryTime={slot.heldUntil} />
                          </p>
                        )}
                        {slot.state === "expired" && (
                          <p className="text-xs mt-1 text-orange-600">
                            This slot has expired
                          </p>
                        )}
                        {slot.heldByUserId && (
                          <p
                            className={`text-xs mt-1 ${slot.state === "held" ? "text-gray-600" : slot.state === "expired" ? "text-orange-600" : "text-red-600"}`}
                          >
                            {slot.heldByUserId}
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
      )}
    </div>
  );
};

const BookingsTab = ({
  bookings,
  bookingsLoading,
  user,
  handleCancelBooking,
  formatDate,
}: any) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-light text-gray-900">My Bookings</h2>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
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
          {bookings.map((booking: any) => (
            <div
              key={booking.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${booking.status === "confirmed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : booking.status === "cancelled" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
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
  );
};

const AdminTab = ({
  deletedSlots,
  deletedSlotsLoading,
  showDeletedSlots,
  setShowDeletedSlots,
  selectedDeletedSlots,
  setSelectedDeletedSlots,
  showRestoreConfirm,
  setShowRestoreConfirm,
  isRestoring,
  formatDate,
  formatTime,
  toggleDeletedSlotSelection,
  toggleAllDeletedSlotsSelection,
  handleRestoreSlots,
}: any) => {
  return (
    <div className="space-y-8">
      {deletedSlots.length > 0 ? (
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-light text-gray-900">
                Recently Deleted Slots
              </h2>
              <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm font-medium">
                {deletedSlots.length} deleted
              </span>
              {selectedDeletedSlots.length > 0 && (
                <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium">
                  {selectedDeletedSlots.length} selected for restore
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {selectedDeletedSlots.length > 0 && (
                <>
                  <button
                    onClick={() => setShowRestoreConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore Selected ({selectedDeletedSlots.length})
                  </button>
                  <button
                    onClick={() => setSelectedDeletedSlots([])}
                    className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Clear Selection
                  </button>
                </>
              )}
              <button
                onClick={() => setShowDeletedSlots(!showDeletedSlots)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Archive className="w-4 h-4" />
                {showDeletedSlots ? "Hide" : "Show"} Deleted
              </button>
            </div>
          </div>

          {showDeletedSlots && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleAllDeletedSlotsSelection}
                    className="flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors"
                  >
                    {selectedDeletedSlots.length === deletedSlots.length ? (
                      <CheckSquare className="w-5 h-5 text-green-600" />
                    ) : (
                      <Square className="w-5 h-5 text-amber-400" />
                    )}
                    Select All Deleted ({deletedSlots.length})
                  </button>
                  {selectedDeletedSlots.length > 0 && (
                    <span className="text-sm text-amber-600">
                      {selectedDeletedSlots.length} of {deletedSlots.length}{" "}
                      selected
                    </span>
                  )}
                </div>
                <div className="text-xs text-amber-600">
                  Select slots to restore them
                </div>
              </div>

              {deletedSlotsLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-500 text-sm font-light">
                    Loading deleted slots...
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {deletedSlots.map((slot: any) => (
                    <div
                      key={slot.id}
                      className={`bg-amber-50 border border-amber-200 rounded-xl p-4 opacity-75 ${selectedDeletedSlots.includes(slot.id) ? "ring-2 ring-green-500 ring-offset-2" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleDeletedSlotSelection(slot.id)}
                            className="flex-shrink-0"
                          >
                            {selectedDeletedSlots.includes(slot.id) ? (
                              <CheckSquare className="w-5 h-5 text-green-600" />
                            ) : (
                              <Square className="w-5 h-5 text-amber-400 hover:text-amber-600 transition-colors" />
                            )}
                          </button>
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <Archive className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {formatDate(slot.startTime)}
                              </span>
                              <span className="text-sm text-gray-600">
                                {formatTime(slot.startTime)} -{" "}
                                {formatTime(slot.endTime)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                Resource:
                              </span>
                              <span className="text-xs font-medium text-gray-700">
                                {slot.resource}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-amber-600">
                                Deleted on:
                              </span>
                              <span className="text-xs text-amber-700">
                                {new Date(slot.updatedAt).toLocaleDateString()}{" "}
                                at{" "}
                                {new Date(slot.updatedAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-medium">
                            Soft Deleted
                          </span>
                          {selectedDeletedSlots.includes(slot.id) && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 border border-green-200 rounded-full text-xs font-medium">
                              Will Restore
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Archive className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-light text-gray-900 mb-3">
            No recently deleted files
          </h3>
          <p className="text-gray-600 mb-6 font-light">
            No slots have been deleted yet
          </p>
        </div>
      )}
    </div>
  );
};

// Restore Confirmation Dialog
const RestoreConfirmDialog = ({
  showRestoreConfirm,
  setShowRestoreConfirm,
  selectedDeletedSlots,
  isRestoring,
  handleRestoreSlots,
}: any) => {
  return (
    <Dialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
      <DialogContent className="sm:max-w-md border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light text-gray-900">
            Confirm Restore
          </DialogTitle>
          <DialogDescription className="text-gray-600 font-light">
            Are you sure you want to restore the selected deleted files?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <RotateCcw className="w-4 h-4 text-green-600" />
              <p className="text-sm font-medium text-green-800">
                Restore {selectedDeletedSlots.length} selected file(s)
              </p>
            </div>
            <p className="text-xs text-green-700">
              These files will be restored and available for booking again.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRestoreSlots}
              disabled={isRestoring}
              className="flex-1 bg-green-600 text-white py-3 rounded-full text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRestoring ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 inline mr-2" />
                  Restore Files
                </>
              )}
            </button>
            <button
              onClick={() => setShowRestoreConfirm(false)}
              disabled={isRestoring}
              className="flex-1 border border-gray-300 py-3 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsPagination, setSlotsPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });
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
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedSlots, setDeletedSlots] = useState<Slot[]>([]);
  const [deletedSlotsLoading, setDeletedSlotsLoading] = useState(false);
  const [deletedSlotsPagination, setDeletedSlotsPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [showDeletedSlots, setShowDeletedSlots] = useState(false);
  const [selectedDeletedSlots, setSelectedDeletedSlots] = useState<string[]>(
    [],
  );
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [activeTab, setActiveTab] = useState<"slots" | "bookings" | "admin">(
    "slots",
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchSlots();
      // Only fetch bookings when bookings tab is active or on initial load
      if (activeTab === "bookings") {
        fetchBookings();
      }
      if (user?.role === "ADMIN") {
        fetchDeletedSlots();
      }
    }
  }, [isAuthenticated, user?.role, activeTab]);

  // Auto-refresh slots every 30 seconds to update hold status
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchSlots(); // Always refresh slots (needed for hold status updates)
      if (activeTab === "bookings") {
        fetchBookings(); // Only refresh bookings when on bookings tab
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, activeTab]);

  // Fetch data when tab changes
  useEffect(() => {
    if (!isAuthenticated) return;

    if (activeTab === "bookings") {
      fetchBookings();
    } else if (activeTab === "admin" && user?.role === "ADMIN") {
      fetchDeletedSlots();
    }
  }, [activeTab, isAuthenticated, user?.role]);

  const fetchSlots = async (
    page: number = slotsPagination.page,
    limit: number = slotsPagination.limit,
  ) => {
    try {
      const response = await apiClient.getAllSlots(page, limit);
      if (response.success && response.data) {
        setSlots(response.data);
        setSlotsPagination({
          page: response.page || page,
          limit: response.limit || limit,
          totalCount: response.totalCount || 0,
          totalPages: response.totalPages || 0,
        });
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

  const fetchDeletedSlots = async (
    page: number = deletedSlotsPagination.page,
    limit: number = deletedSlotsPagination.limit,
  ) => {
    if (user?.role !== "ADMIN") return;

    setDeletedSlotsLoading(true);
    try {
      const response = await apiClient.getDeletedSlots(page, limit);
      if (response.success && response.data) {
        setDeletedSlots(response.data);
        setDeletedSlotsPagination({
          page: response.page || page,
          limit: response.limit || limit,
          totalCount: response.totalCount || 0,
          totalPages: response.totalPages || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch deleted slots:", error);
    } finally {
      setDeletedSlotsLoading(false);
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
        fetchSlots(); // Refresh slots to show updated state
        setTimeout(() => setSuccess(""), 5000); // Show success for 5 seconds

        // Set up auto-refresh when hold is about to expire
        if (selectedSlot.heldUntil) {
          const holdExpiry = new Date(selectedSlot.heldUntil);
          const now = new Date();
          const timeUntilExpiry = holdExpiry.getTime() - now.getTime();

          // Refresh 30 seconds before expiry and every 10 seconds after
          if (timeUntilExpiry > 30000) {
            setTimeout(() => {
              const refreshInterval = setInterval(() => {
                fetchSlots();
              }, 10000);

              // Clear interval after 2 minutes
              setTimeout(() => clearInterval(refreshInterval), 120000);
            }, timeUntilExpiry - 30000);
          }
        }
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
        setTimeout(() => setSuccess(""), 5000); // Show success for 5 seconds
      } else {
        // Handle specific booking errors
        if (
          response.error?.includes("hold") ||
          response.error?.includes("expired")
        ) {
          setError(
            "Hold has expired or slot is no longer available. Please try holding the slot again.",
          );
          fetchSlots(); // Refresh to show current state
        } else {
          setError(response.error || "Failed to create booking");
        }
        setSuccess("");
      }
    } catch (error: unknown) {
      console.error("Booking error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create booking";

      // Provide more specific error messages
      if (errorMessage.includes("hold") || errorMessage.includes("expired")) {
        setError(
          "Hold has expired or slot is no longer available. Please try holding the slot again.",
        );
        fetchSlots(); // Refresh to show current state
      } else {
        setError(errorMessage);
      }
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
        setTimeout(() => setSuccess(""), 5000); // Show success for 5 seconds
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
        setTimeout(() => setSuccess(""), 5000); // Show success for 5 seconds
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

  const handleDeleteSlots = async () => {
    if (selectedSlots.length === 0) return;

    setIsDeleting(true);
    try {
      const response = await apiClient.deleteSlots(selectedSlots);

      if (response.success) {
        setSuccess(`Successfully deleted ${selectedSlots.length} slot(s)`);
        setError("");
        setSelectedSlots([]);
        setShowDeleteConfirm(false);
        fetchSlots(); // Refresh slots
        fetchDeletedSlots(); // Refresh deleted slots
        setTimeout(() => setSuccess(""), 5000); // Show success for 5 seconds
      } else {
        setError(response.error || "Failed to delete slots");
        setSuccess("");
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Failed to delete slots",
      );
      setSuccess("");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSlotSelection = (slotId: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId],
    );
  };

  const toggleAllSlotsSelection = () => {
    if (selectedSlots.length === slots.length) {
      setSelectedSlots([]);
    } else {
      setSelectedSlots(slots.map((slot) => slot.id));
    }
  };

  const toggleDeletedSlotSelection = (slotId: string) => {
    setSelectedDeletedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId],
    );
  };

  const toggleAllDeletedSlotsSelection = () => {
    if (selectedDeletedSlots.length === deletedSlots.length) {
      setSelectedDeletedSlots([]);
    } else {
      setSelectedDeletedSlots(deletedSlots.map((slot) => slot.id));
    }
  };

  const handleRestoreSlots = async () => {
    if (selectedDeletedSlots.length === 0) return;

    setIsRestoring(true);
    try {
      const response = await apiClient.restoreSlots(selectedDeletedSlots);

      if (response.success) {
        setSuccess(
          `Successfully restored ${selectedDeletedSlots.length} slot(s)`,
        );
        setError("");
        setSelectedDeletedSlots([]);
        setShowRestoreConfirm(false);
        fetchSlots(); // Refresh active slots
        fetchDeletedSlots(); // Refresh deleted slots
        setTimeout(() => setSuccess(""), 5000); // Show success for 5 seconds
      } else {
        setError(response.error || "Failed to restore slots");
        setSuccess("");
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Failed to restore slots",
      );
      setSuccess("");
    } finally {
      setIsRestoring(false);
    }
  };

  // Pagination handlers
  const handleSlotsPageChange = (page: number) => {
    setSlotsPagination((prev) => ({ ...prev, page }));
    fetchSlots(page, slotsPagination.limit);
  };

  const handleDeletedSlotsPageChange = (page: number) => {
    setDeletedSlotsPagination((prev) => ({ ...prev, page }));
    fetchDeletedSlots(page, deletedSlotsPagination.limit);
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

  const isSlotBooked = (slot: Slot) => {
    return slot.state === "booked";
  };

  const isSlotExpired = (slot: Slot) => {
    return slot.state === "expired";
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

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("slots")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "slots"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Available Slots
                </div>
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "bookings"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  My Bookings
                </div>
              </button>
              {user?.role === "ADMIN" && (
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "admin"
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Admin Panel
                  </div>
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === "slots" && (
            <>
              <SlotsTab
                slots={slots}
                slotsLoading={slotsLoading}
                selectedSlot={selectedSlot}
                setSelectedSlot={setSelectedSlot}
                isBookingDialogOpen={isBookingDialogOpen}
                setIsBookingDialogOpen={setIsBookingDialogOpen}
                selectedSlots={selectedSlots}
                setSelectedSlots={setSelectedSlots}
                showDeleteConfirm={showDeleteConfirm}
                setShowDeleteConfirm={setShowDeleteConfirm}
                isDeleting={isDeleting}
                user={user}
                formatDate={formatDate}
                formatTime={formatTime}
                isSlotAvailable={isSlotAvailable}
                handleHoldSlot={handleHoldSlot}
                handleBooking={handleBooking}
                handleDeleteSlots={handleDeleteSlots}
                toggleSlotSelection={toggleSlotSelection}
                toggleAllSlotsSelection={toggleAllSlotsSelection}
                setIsCreateSlotDialogOpen={setIsCreateSlotDialogOpen}
                newSlot={newSlot}
                setNewSlot={setNewSlot}
                handleCreateSlot={handleCreateSlot}
              />

              {/* Pagination for Slots */}
              {!slotsLoading && slots.length > 0 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={slotsPagination.page}
                    totalPages={slotsPagination.totalPages}
                    onPageChange={handleSlotsPageChange}
                    totalCount={slotsPagination.totalCount}
                    limit={slotsPagination.limit}
                  />
                </div>
              )}
            </>
          )}

          {activeTab === "bookings" && (
            <BookingsTab
              bookings={bookings}
              bookingsLoading={bookingsLoading}
              user={user}
              handleCancelBooking={handleCancelBooking}
              formatDate={formatDate}
            />
          )}

          {activeTab === "admin" && user?.role === "ADMIN" && (
            <>
              <AdminTab
                deletedSlots={deletedSlots}
                deletedSlotsLoading={deletedSlotsLoading}
                showDeletedSlots={showDeletedSlots}
                setShowDeletedSlots={setShowDeletedSlots}
                selectedDeletedSlots={selectedDeletedSlots}
                setSelectedDeletedSlots={setSelectedDeletedSlots}
                showRestoreConfirm={showRestoreConfirm}
                setShowRestoreConfirm={setShowRestoreConfirm}
                isRestoring={isRestoring}
                formatDate={formatDate}
                formatTime={formatTime}
                toggleDeletedSlotSelection={toggleDeletedSlotSelection}
                toggleAllDeletedSlotsSelection={toggleAllDeletedSlotsSelection}
                handleRestoreSlots={handleRestoreSlots}
              />

              {/* Pagination for Deleted Slots */}
              {!deletedSlotsLoading &&
                deletedSlots.length > 0 &&
                showDeletedSlots && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={deletedSlotsPagination.page}
                      totalPages={deletedSlotsPagination.totalPages}
                      onPageChange={handleDeletedSlotsPageChange}
                      totalCount={deletedSlotsPagination.totalCount}
                      limit={deletedSlotsPagination.limit}
                    />
                  </div>
                )}
            </>
          )}
        </div>
      </main>

      {/* Restore Confirmation Dialog */}
      <RestoreConfirmDialog
        showRestoreConfirm={showRestoreConfirm}
        setShowRestoreConfirm={setShowRestoreConfirm}
        selectedDeletedSlots={selectedDeletedSlots}
        isRestoring={isRestoring}
        handleRestoreSlots={handleRestoreSlots}
      />
    </div>
  );
}
