"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, Slot, Booking } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
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
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Timer,
  Sparkles,
  Zap,
  ArrowRight,
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
  handleJoinWaitlist,
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
                  onClick={() =>
                    handleCreateSlot(() =>
                      setIsCreateSlotDialogOpenLocal(false),
                    )
                  }
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot: any) => (
            <div
              key={slot.id}
              className={`group relative bg-white border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${selectedSlots.includes(slot.id) ? "ring-2 ring-blue-500 ring-offset-2 shadow-xl border-blue-500" : slot.state === "expired" ? "border-orange-200 opacity-75" : "border-gray-200"}`}
            >
              {/* Status Badge */}
              <div className="absolute top-3 right-3 z-10">
                <div
                  className={`px-3 py-1.5 rounded-full text-xs font-serif italic shadow-sm transition-all duration-200 ${isSlotAvailable(slot) ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/30" : slot.state === "held" ? (slot.heldByUserId === user?.id ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-500/30" : "bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-gray-500/30") : slot.state === "expired" ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-orange-500/30" : "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/30"}`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${isSlotAvailable(slot) ? "bg-white/90" : "bg-white/90"} animate-pulse`}
                    />
                    <span className="font-medium tracking-wide">
                      {isSlotAvailable(slot)
                        ? "Available"
                        : slot.state === "held"
                          ? slot.heldByUserId === user?.id
                            ? "Your Hold"
                            : "On Hold"
                          : slot.state === "expired"
                            ? "Expired"
                            : "Booked"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Selection Checkbox */}
              {user?.role === "ADMIN" && (
                <div className="absolute top-3 left-3 z-10">
                  <button
                    onClick={() => toggleSlotSelection(slot.id)}
                    className={`p-1.5 rounded-md transition-colors ${selectedSlots.includes(slot.id) ? "bg-blue-500 text-white" : "bg-white border border-gray-300 text-gray-400 hover:text-gray-600"}`}
                  >
                    {selectedSlots.includes(slot.id) ? (
                      <CheckSquare className="w-3.5 h-3.5" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}

              {/* Card Content */}
              <div className="p-5">
                {/* Date and Time */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <h3 className="text-base font-semibold text-gray-900">
                      {formatDate(slot.startTime)}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </span>
                  </div>
                </div>

                {/* Resource */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {slot.resource}
                    </span>
                  </div>
                </div>

                {/* Status Information */}
                <div className="space-y-2">
                  {slot.state === "held" &&
                    slot.heldUntil &&
                    slot.heldByUserId === user?.id && (
                      <div className="flex items-center gap-2 text-xs font-serif italic text-amber-700 bg-amber-50/80 border border-amber-200/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                        <Timer className="w-3 h-3 text-amber-600" />
                        <span className="tracking-wide">Hold Expires</span>
                        <span className="ml-auto">
                          <CountdownTimer expiryTime={slot.heldUntil} />
                        </span>
                      </div>
                    )}

                  {slot.state === "held" && slot.heldByUserId !== user?.id && (
                    <div className="flex items-center gap-2 text-xs font-serif italic text-purple-700 bg-purple-50/80 border border-purple-200/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                      <Users className="w-3 h-3 text-purple-600" />
                      <span className="tracking-wide">Currently Held</span>
                    </div>
                  )}

                  {slot.state === "expired" && (
                    <div className="text-xs font-serif italic text-orange-700 bg-orange-50/80 border border-orange-200/50 px-3 py-2 rounded-lg backdrop-blur-sm text-center">
                      <span className="tracking-wide">No Longer Available</span>
                    </div>
                  )}

                  {slot.booking?.user && (
                    <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/80 border border-blue-200/60 rounded-lg p-3 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-3 h-3 text-blue-600" />
                        <span className="text-xs font-serif italic text-blue-900 tracking-wide">
                          Reserved
                        </span>
                      </div>
                      <p className="text-xs font-serif text-blue-800 font-medium">
                        {slot.booking.user.name}
                      </p>
                      <p className="text-xs font-serif text-blue-600">
                        {slot.booking.user.email}
                      </p>
                    </div>
                  )}

                  {slot.heldByUserId &&
                    !slot.booking?.user &&
                    slot.heldByUserId !== user?.id && (
                      <div className="text-xs font-serif italic text-purple-600 bg-purple-50/80 border border-purple-200/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                        <span className="tracking-wide">
                          Join waiting list to be notified
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {/* Action Button */}
              <div className="px-5 pb-5">
                {isSlotAvailable(slot) ? (
                  <Dialog
                    open={isBookingDialogOpen && selectedSlot?.id === slot.id}
                    onOpenChange={setIsBookingDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <button
                        onClick={() => setSelectedSlot(slot)}
                        className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
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
                ) : slot.state === "booked" &&
                  slot.booking?.user?.email !== user?.email ? (
                  slot.waitlist && slot.waitlist.length > 0 ? (
                    <button
                      disabled
                      className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white py-3 rounded-xl text-sm font-medium opacity-60 cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Users className="w-4 h-4" />
                      You're #{slot.waitlist[0].position} in line
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center text-sm font-serif italic text-red-700 bg-red-50/80 border border-red-200/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                        <span className="tracking-wide">
                          Already booked by {slot.booking?.user?.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleJoinWaitlist(slot.id)}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <Users className="w-4 h-4" />
                        Join Waiting List
                      </button>
                    </div>
                  )
                ) : slot.state === "held" && slot.heldByUserId !== user?.id ? (
                  slot.waitlist && slot.waitlist.length > 0 ? (
                    <button
                      disabled
                      className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white py-3 rounded-xl text-sm font-medium opacity-60 cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Users className="w-4 h-4" />
                      You're #{slot.waitlist[0].position} in line
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center text-sm font-serif italic text-amber-700 bg-amber-50/80 border border-amber-200/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                        <span className="tracking-wide">
                          Currently held by another user
                        </span>
                      </div>
                      <button
                        onClick={() => handleJoinWaitlist(slot.id)}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <Users className="w-4 h-4" />
                        Join Waiting List
                      </button>
                    </div>
                  )
                ) : (
                  <div className="text-center py-3 opacity-60">
                    <div className="text-gray-400 text-sm font-serif italic">
                      {slot.state === "held"
                        ? "Currently Held"
                        : slot.state === "expired"
                          ? "No Longer Available"
                          : "Reserved"}
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
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-3 rounded-xl border border-amber-200 shadow-sm">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Archive className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif text-gray-900 font-light">
                      Archive Management
                    </h2>
                    <p className="text-sm text-amber-700 font-medium">
                      Manage deleted slots
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-4 py-2 bg-amber-500 text-white rounded-full text-sm font-semibold shadow-lg">
                    {deletedSlots.length}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    total
                  </span>
                  {selectedDeletedSlots.length > 0 && (
                    <span className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-semibold shadow-lg animate-pulse">
                      {selectedDeletedSlots.length} selected
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {selectedDeletedSlots.length > 0 && (
                <>
                  <button
                    onClick={() => setShowRestoreConfirm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Restore Selected ({selectedDeletedSlots.length})
                  </button>
                  <button
                    onClick={() => setSelectedDeletedSlots([])}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300"
                  >
                    Clear Selection
                  </button>
                </>
              )}
              <button
                onClick={() => setShowDeletedSlots(!showDeletedSlots)}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300"
              >
                <Archive className="w-5 h-5" />
                {showDeletedSlots ? "Hide Archive" : "Show Archive"}
              </button>
            </div>
          </div>

          {/* Archive Section */}
          {showDeletedSlots && (
            <div className="space-y-6">
              {/* Selection Controls */}
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-50/80 to-orange-50/80 rounded-xl border border-amber-200/60 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleAllDeletedSlotsSelection}
                    className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg text-sm font-serif font-medium text-amber-700 hover:bg-amber-50 transition-all duration-300 shadow-sm"
                  >
                    {selectedDeletedSlots.length === deletedSlots.length ? (
                      <CheckSquare className="w-5 h-5 text-green-600" />
                    ) : (
                      <Square className="w-5 h-5 text-amber-400" />
                    )}
                    <span className="tracking-wide">
                      {selectedDeletedSlots.length === deletedSlots.length
                        ? "Deselect All"
                        : "Select All"}{" "}
                      ({deletedSlots.length})
                    </span>
                  </button>
                  {selectedDeletedSlots.length > 0 && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-serif font-medium">
                      {selectedDeletedSlots.length} of {deletedSlots.length}{" "}
                      selected
                    </span>
                  )}
                </div>
                <div className="text-xs font-serif italic text-amber-600">
                  Select archived slots to restore them to active status
                </div>
              </div>

              {/* Loading State */}
              {deletedSlotsLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-8 h-8 border-3 border-amber-300 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-amber-600 text-sm font-serif font-light">
                    Loading archived slots...
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {deletedSlots.map((slot: any) => (
                    <div
                      key={slot.id}
                      className={`group relative bg-white border-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${selectedDeletedSlots.includes(slot.id) ? "border-green-500 ring-2 ring-green-200 shadow-lg" : "border-amber-200"}`}
                    >
                      {/* Selection Checkbox */}
                      <div className="absolute top-3 left-3 z-10">
                        <button
                          onClick={() => toggleDeletedSlotSelection(slot.id)}
                          className={`p-2 rounded-lg transition-all duration-200 ${selectedDeletedSlots.includes(slot.id) ? "bg-green-500 text-white" : "bg-white border border-gray-300 text-gray-400 hover:text-amber-600"}`}
                        >
                          {selectedDeletedSlots.includes(slot.id) ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <div className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full text-xs font-serif italic shadow-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />
                            <span className="font-medium tracking-wide">
                              Archived
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-amber-100 rounded-lg">
                              <Archive className="w-4 h-4 text-amber-600" />
                            </div>
                            <span className="px-2 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-serif font-medium">
                              Deleted
                            </span>
                          </div>
                          {selectedDeletedSlots.includes(slot.id) && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-serif font-medium">
                              ✓ Selected
                            </span>
                          )}
                        </div>

                        {/* Slot Details */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-serif text-gray-900">
                              {formatDate(slot.startTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span className="text-sm text-gray-600">
                              {formatTime(slot.startTime)} -{" "}
                              {formatTime(slot.endTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-serif text-gray-900">
                              {slot.resource}
                            </span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-4 pt-3 border-t border-amber-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-serif italic text-amber-600">
                              Archived {formatDate(slot.updatedAt)}
                            </span>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                              <span className="text-xs font-serif text-amber-700">
                                Ready to restore
                              </span>
                            </div>
                          </div>
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
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Archive className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-serif text-gray-900 mb-4">
            No Archived Slots
          </h3>
          <p className="text-gray-600 text-lg font-light">
            Deleted slots will appear here for restoration
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
  const { toast } = useToast();
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
        // Show success toast
        toast({
          title: "Success!",
          description: "Slot held successfully! You can now book it.",
          variant: "success",
        });
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
        // Show error toast
        toast({
          title: "Error!",
          description: response.error || "Failed to hold slot",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error("Hold slot error:", error);
      setError(error instanceof Error ? error.message : "Failed to hold slot");
      setSuccess("");
      // Show error toast
      toast({
        title: "Error!",
        description:
          error instanceof Error ? error.message : "Failed to hold slot",
        variant: "destructive",
      });
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
        // Show success toast
        toast({
          title: "Success!",
          description: "Booking created successfully!",
          variant: "success",
        });
        setTimeout(() => setSuccess(""), 5000); // Show success for 5 seconds
      } else {
        // Always show the actual API response first
        const errorMessage = response.error || "Failed to create booking";

        // Set the error message
        setError(errorMessage);

        // Show error toast with the actual API response
        toast({
          title: "Error!",
          description: errorMessage,
          variant: "destructive",
        });

        // Only refresh slots for specific errors
        if (
          errorMessage?.includes("hold") ||
          errorMessage?.includes("expired") ||
          errorMessage?.includes("booking")
        ) {
          fetchSlots(); // Refresh to show current state
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
        // Show error toast
        toast({
          title: "Hold Expired!",
          description:
            "Hold has expired or slot is no longer available. Please try holding the slot again.",
          variant: "destructive",
        });
      } else {
        setError(errorMessage);
        // Show error toast
        toast({
          title: "Error!",
          description: errorMessage,
          variant: "destructive",
        });
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
        // Show success toast
        toast({
          title: "Success!",
          description: "Booking cancelled successfully!",
          variant: "success",
        });
        setTimeout(() => setSuccess(""), 5000); // Show success for 5 seconds
      } else {
        setError(response.error || "Failed to cancel booking");
        setSuccess("");
        // Show error toast
        toast({
          title: "Error!",
          description: response.error || "Failed to cancel booking",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Failed to cancel booking",
      );
      setSuccess("");
      // Show error toast
      toast({
        title: "Error!",
        description:
          error instanceof Error ? error.message : "Failed to cancel booking",
        variant: "destructive",
      });
    }
  };

  const handleJoinWaitlist = async (slotId: string) => {
    try {
      const response = await apiClient.joinWaitlist(slotId);

      if (response.success) {
        setSuccess("Successfully joined waiting list!");
        setError("");
        // Show success toast
        toast({
          title: "Success!",
          description:
            "You've been added to the waiting list. We'll notify you when this slot becomes available!",
          variant: "success",
        });

        // Refresh slots to get updated waitlist status
        fetchSlots();

        setTimeout(() => setSuccess(""), 5000); // Show success for 5 seconds
      } else {
        setError(response.error || "Failed to join waiting list");
        setSuccess("");
        // Show error toast
        toast({
          title: "Error!",
          description: response.error || "Failed to join waiting list",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Failed to join waiting list",
      );
      setSuccess("");
      // Show error toast
      toast({
        title: "Error!",
        description:
          error instanceof Error
            ? error.message
            : "Failed to join waiting list",
        variant: "destructive",
      });
    }
  };

  const handleCreateSlot = async (onCloseDialog?: () => void) => {
    try {
      if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
        setError("Please fill in all required fields");
        return;
      }

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
        if (onCloseDialog) onCloseDialog(); // Close the local dialog
        setNewSlot({ resource: "", date: "", startTime: "", endTime: "" });
        setSuccess("Slot created successfully!");
        setError("");
        fetchSlots(); // Refresh slots
        // Show success toast
        toast({
          title: "Success!",
          description: "Slot created successfully!",
          variant: "success",
        });
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 5000); // Show success for 5 seconds
      } else {
        setError(response.error || "Failed to create slot");
        setSuccess("");
        // Show error toast
        toast({
          title: "Error!",
          description: response.error || "Failed to create slot",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Failed to create slot",
      );
      setSuccess("");
      console.error("Failed to create slot:", error);
      // Show error toast
      toast({
        title: "Error!",
        description:
          error instanceof Error ? error.message : "Failed to create slot",
        variant: "destructive",
      });
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
        // Show success toast
        toast({
          title: "Success!",
          description: `Successfully deleted ${selectedSlots.length} slot(s)`,
          variant: "success",
        });
        setTimeout(() => setSuccess(""), 5000); // Show success for 5 seconds
      } else {
        setError(response.error || "Failed to delete slots");
        setSuccess("");
        // Show error toast
        toast({
          title: "Error!",
          description: response.error || "Failed to delete slots",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Failed to delete slots",
      );
      setSuccess("");
      // Show error toast
      toast({
        title: "Error!",
        description:
          error instanceof Error ? error.message : "Failed to delete slots",
        variant: "destructive",
      });
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
        // Show success toast
        toast({
          title: "Success!",
          description: `Successfully restored ${selectedDeletedSlots.length} slot(s)`,
          variant: "success",
        });
        setTimeout(() => setSuccess(""), 5000); // Show success for 5 seconds
      } else {
        setError(response.error || "Failed to restore slots");
        setSuccess("");
        // Show error toast
        toast({
          title: "Error!",
          description: response.error || "Failed to restore slots",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Failed to restore slots",
      );
      setSuccess("");
      // Show error toast
      toast({
        title: "Error!",
        description:
          error instanceof Error ? error.message : "Failed to restore slots",
        variant: "destructive",
      });
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
                handleJoinWaitlist={handleJoinWaitlist}
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

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
