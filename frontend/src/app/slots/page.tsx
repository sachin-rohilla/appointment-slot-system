"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { slotsAPI, waitlistAPI, bookingsAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  CheckCircle,
  Lock,
  AlertCircle,
  X,
} from "lucide-react";

interface Slot {
  id: string;
  resource: string;
  startTime: string;
  endTime: string;
  state: "available" | "held" | "booked";
  isDeleted: boolean;
  heldByUserId?: string;
  heldUntil?: string;
  canJoinWaitlist?: boolean;
  bookingId?: string;
  isBookedByUser?: boolean;
  isInWaitlist?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationResponse {
  result: Slot[];
  page: number;
  limit: number;
  total_pages: number;
  total: number;
}

export default function SlotsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total_pages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [holdingSlotId, setHoldingSlotId] = useState<string | null>(null);
  const [joiningWaitlistId, setJoiningWaitlistId] = useState<string | null>(
    null,
  );
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(
    null,
  );
  const [filters, setFilters] = useState({
    resource: "",
    date: "",
  });
  const [debouncedFilters, setDebouncedFilters] = useState({
    resource: "",
    date: "",
  });

  // Debounce filters to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [filters]);

  // Fetch slots when debounced filters or pagination changes
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const activeFilters = getActiveFilters(debouncedFilters);
      fetchSlots(pagination.page, pagination.limit, activeFilters);
    }
  }, [debouncedFilters, pagination.page, pagination.limit]);

  // Initial load
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchSlots();
    }
  }, [isAuthenticated, isLoading]);

  const getTimeRemaining = (heldUntil: string) => {
    const now = new Date();
    const heldUntilDate = new Date(heldUntil);
    const timeDiff = heldUntilDate.getTime() - now.getTime();

    if (timeDiff <= 0) {
      return { expired: true, text: "Hold expired" };
    }

    const minutes = Math.floor(timeDiff / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return {
      expired: false,
      text: `${minutes}:${seconds.toString().padStart(2, "0")} min left`,
    };
  };

  const fetchSlots = async (
    page = 1,
    limit = 10,
    filters?: { resource?: string; startDate?: string },
  ) => {
    try {
      setLoading(true);
      const response = await slotsAPI.getAllSlots(page, limit, filters);
      // Backend returns: { success: true, data: { result, page, limit, total_pages, total }, message: "Slots fetched successfully" }
      const paginationData = response.data?.data || {};
      setSlots(paginationData.result || []);
      setPagination({
        page: paginationData.page || 1,
        limit: paginationData.limit || 10,
        total_pages: paginationData.total_pages || 1,
        total: paginationData.total || 0,
      });
    } catch (error: unknown) {
      console.error("Error fetching slots:", error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to fetch slots";
      toast.error(message);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleHoldSlot = async (slotId: string) => {
    setHoldingSlotId(slotId);

    try {
      await slotsAPI.updateSlot(slotId);
      // Backend returns: { success: true, message: "Slot updated successfully" }
      toast.success("Slot held successfully!");

      // Refresh slots to show updated state
      const activeFilters = getActiveFilters(debouncedFilters);
      await fetchSlots(pagination.page, pagination.limit, activeFilters);
    } catch (error: unknown) {
      console.error("Error holding slot:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to hold slot";
      toast.error(errorMessage);
    } finally {
      setHoldingSlotId(null);
    }
  };

  const handleBookSlot = async (slotId: string) => {
    if (
      !confirm(
        "Are you sure you want to book this slot? This will confirm your appointment.",
      )
    ) {
      return;
    }

    try {
      setHoldingSlotId(slotId);
      await bookingsAPI.createBooking(slotId);
      toast.success("Slot booked successfully!");
      fetchSlots(); // Refresh slots to show updated state
    } catch (error: unknown) {
      console.error("Error booking slot:", error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to book slot";
      toast.error(message);
    } finally {
      setHoldingSlotId(null);
    }
  };

  const handleJoinWaitlist = async (slotId: string) => {
    if (
      !confirm(
        "Do you want to join waitlist? You'll be notified if this slot becomes available.",
      )
    ) {
      return;
    }

    try {
      setJoiningWaitlistId(slotId);
      await waitlistAPI.joinWaitlist(slotId);
      toast.success("Joined waitlist successfully!");
      const filters = getActiveFilters();
      fetchSlots(pagination.page, pagination.limit, filters);
    } catch (error: unknown) {
      console.error("Error joining waitlist:", error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to join waitlist";
      toast.error(message);
    } finally {
      setJoiningWaitlistId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      const activeFilters = getActiveFilters(debouncedFilters);
      fetchSlots(newPage, pagination.limit, activeFilters);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    const activeFilters = getActiveFilters(debouncedFilters);
    fetchSlots(1, newLimit, activeFilters);
  };

  const getActiveFilters = useCallback((currentFilters: typeof filters) => {
    const activeFilters: { resource?: string; startDate?: string } = {};
    if (currentFilters.resource?.trim()) {
      activeFilters.resource = currentFilters.resource.trim();
    }
    if (currentFilters.date) {
      activeFilters.startDate = currentFilters.date;
    }
    return activeFilters;
  }, []);

  const hasActiveFilters = useMemo(() => {
    return !!(filters.resource?.trim() || filters.date);
  }, [filters]);

  const handleFilterChange = useCallback(() => {
    // Reset to page 1 when filters change
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ resource: "", date: "" });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleResourceChange = useCallback(
    (value: string) => {
      setFilters((prev) => ({ ...prev, resource: value }));
      handleFilterChange();
    },
    [handleFilterChange],
  );

  const handleDateChange = useCallback(
    (value: string) => {
      setFilters((prev) => ({ ...prev, date: value }));
      handleFilterChange();
    },
    [handleFilterChange],
  );

  const handleCancelBooking = async (slotId: string) => {
    if (
      !confirm(
        "Are you sure you want to cancel this booking? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setCancellingBookingId(slotId);
      await bookingsAPI.cancelBooking(slotId);
      toast.success("Booking cancelled successfully!");
      const filters = getActiveFilters();
      fetchSlots(pagination.page, pagination.limit, filters);
    } catch (error: unknown) {
      console.error("Error cancelling booking:", error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to cancel booking";
      toast.error(message);
    } finally {
      setCancellingBookingId(null);
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case "available":
        return "bg-green-100 text-green-800";
      case "booked":
        return "bg-red-100 text-red-800";
      case "held":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case "available":
        return <CheckCircle className="h-4 w-4" />;
      case "booked":
        return <Lock className="h-4 w-4" />;
      case "held":
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getDisplayStatus = (slot: Slot) => {
    if (slot.isInWaitlist) {
      return {
        text: "waitlist",
        color: "bg-blue-100 text-blue-800",
        icon: <Clock className="h-4 w-4" />,
      };
    }
    return {
      text: slot.state,
      color: getStateColor(slot.state),
      icon: getStateIcon(slot.state),
    };
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Available Slots
        </h1>
        <p className="text-gray-600">Browse and hold appointment slots</p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filter Slots
            </CardTitle>
            {hasActiveFilters && (
              <Button
                onClick={handleClearFilters}
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="resource-filter">Resource</Label>
              <Input
                id="resource-filter"
                type="text"
                placeholder="Search by resource name..."
                value={filters.resource}
                onChange={(e) => handleResourceChange(e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
              {filters.resource && (
                <p className="text-xs text-gray-500 mt-1">
                  Searching: "{filters.resource}"
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="date-filter">Date</Label>
              <Input
                id="date-filter"
                type="date"
                value={filters.date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
              {filters.date && (
                <p className="text-xs text-gray-500 mt-1">
                  From: {format(new Date(filters.date), "MMM d, yyyy")}
                </p>
              )}
            </div>
          </div>
          {hasActiveFilters && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Calendar className="h-4 w-4" />
                <span>
                  {filters.resource && `Resource: "${filters.resource}"`}
                  {filters.resource && filters.date && " • "}
                  {filters.date &&
                    `From: ${format(new Date(filters.date), "MMM d, yyyy")}`}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slots Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : slots.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No slots found
            </h3>
            <p className="text-gray-600">
              {filters.resource || filters.date
                ? "Try adjusting your filters to see more results"
                : "No available slots at the moment. Check back later."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slots.map((slot) => (
            <Card key={slot.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{slot.resource}</h3>
                  <Badge className={getDisplayStatus(slot).color}>
                    <div className="flex items-center gap-1">
                      {getDisplayStatus(slot).icon}
                      {getDisplayStatus(slot).text}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(slot.startTime), "MMM dd, yyyy")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {format(new Date(slot.startTime), "h:mm a")} -{" "}
                    {format(new Date(slot.endTime), "h:mm a")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    Duration:{" "}
                    {Math.round(
                      (new Date(slot.endTime).getTime() -
                        new Date(slot.startTime).getTime()) /
                        (1000 * 60),
                    )}{" "}
                    minutes
                  </div>
                </div>

                {/* Hold Button - MAIN ACTION - Always show for available slots */}
                {slot.state === "available" && (
                  <Button
                    onClick={() => handleHoldSlot(slot.id)}
                    disabled={holdingSlotId === slot.id}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
                  >
                    {holdingSlotId === slot.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Reserving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Lock className="h-5 w-5" />
                        <span>Hold This Slot</span>
                      </div>
                    )}
                  </Button>
                )}

                {slot.state === "held" && slot.heldByUserId === user?.id && (
                  <div className="w-full bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Lock className="h-5 w-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">
                        Slot Reserved
                      </span>
                    </div>
                    {slot.heldUntil && (
                      <div className="text-sm text-yellow-700 font-medium mb-3">
                        {getTimeRemaining(slot.heldUntil).expired ? (
                          <span className="text-red-600">Hold Expired</span>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{getTimeRemaining(slot.heldUntil).text}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <Button
                      onClick={() => handleBookSlot(slot.id)}
                      disabled={
                        holdingSlotId === slot.id ||
                        (slot.heldUntil
                          ? getTimeRemaining(slot.heldUntil).expired
                          : false)
                      }
                      className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
                    >
                      {holdingSlotId === slot.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Booking...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          <span>Book Now</span>
                        </div>
                      )}
                    </Button>
                  </div>
                )}

                {slot.state === "held" && slot.heldByUserId !== user?.id && (
                  <div className="w-full bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Lock className="h-5 w-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">
                        Slot Reserved by Another User
                      </span>
                    </div>
                    {slot.heldUntil && (
                      <div className="text-sm text-yellow-700 font-medium mb-3">
                        {getTimeRemaining(slot.heldUntil).expired ? (
                          <span className="text-red-600">Hold Expired</span>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{getTimeRemaining(slot.heldUntil).text}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {slot.canJoinWaitlist === true && (
                      <div className="text-sm text-yellow-700 font-medium mb-3">
                        <span className="flex items-center justify-center gap-2">
                          <Clock className="h-4 w-4" />
                          Join waitlist to be notified if slot becomes available
                        </span>
                      </div>
                    )}
                    {slot.canJoinWaitlist === true && (
                      <Button
                        onClick={() => handleJoinWaitlist(slot.id)}
                        disabled={joiningWaitlistId === slot.id}
                        className="w-full h-12 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold shadow-lg"
                      >
                        {joiningWaitlistId === slot.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Joining...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Clock className="h-5 w-5" />
                            <span>Join Waitlist</span>
                          </div>
                        )}
                      </Button>
                    )}
                  </div>
                )}

                {slot.state === "booked" && (
                  <div className="w-full bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 rounded-lg p-4 text-center">
                    {slot.isInWaitlist ? (
                      <>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold text-blue-800">
                            You are in Waitlist
                          </span>
                        </div>
                        <div className="text-sm text-blue-700 font-medium mb-3">
                          You'll be notified if this slot becomes available
                        </div>
                      </>
                    ) : slot.isBookedByUser ? (
                      <>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-green-800">
                            Booked by You
                          </span>
                        </div>
                        <div className="text-sm text-green-700 font-medium mb-3">
                          Your appointment is confirmed
                        </div>
                        <Button
                          onClick={() => handleCancelBooking(slot.bookingId!)}
                          disabled={cancellingBookingId === slot.bookingId}
                          className="w-full h-12 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold shadow-lg"
                        >
                          {cancellingBookingId === slot.bookingId ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Cancelling...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <CheckCircle className="h-5 w-5" />
                              <span>Cancel Booking</span>
                            </div>
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-red-600" />
                          <span className="font-semibold text-red-800">
                            Already Booked
                          </span>
                        </div>
                        {slot.canJoinWaitlist === true && (
                          <div className="text-sm text-red-700 font-medium mb-3">
                            <span className="flex items-center justify-center gap-2">
                              <Clock className="h-4 w-4" />
                              Join waitlist to be notified if slot becomes
                              available
                            </span>
                          </div>
                        )}
                        {slot.canJoinWaitlist === true && (
                          <Button
                            onClick={() => handleJoinWaitlist(slot.id)}
                            disabled={joiningWaitlistId === slot.id}
                            className="w-full h-12 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold shadow-lg"
                          >
                            {joiningWaitlistId === slot.id ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Joining...</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <Clock className="h-5 w-5" />
                                <span>Join Waitlist</span>
                              </div>
                            )}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination - Always show for testing */}
      {true && ( // Changed from pagination.total_pages > 1 to always show
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>
              Debug: page={pagination.page}, total_pages=
              {pagination.total_pages}, total={pagination.total}
            </span>
            <span>
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} slots
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pagination.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>

            <div className="flex items-center gap-1">
              <Button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                ‹
              </Button>

              <span className="px-3 py-1 text-sm font-medium">
                Page {pagination.page} of {pagination.total_pages}
              </span>

              <Button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.total_pages}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                ›
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
