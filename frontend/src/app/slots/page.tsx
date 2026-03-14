"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { slotsAPI, bookingsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, CheckCircle, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Slot {
  id: string;
  resource: string;
  startTime: string;
  endTime: string;
  state: "available" | "held" | "booked";
  heldByUserId?: string;
  heldUntil?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SlotsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [holdingSlotId, setHoldingSlotId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filters, setFilters] = useState({
    resource: "",
    date: "",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSlots();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterSlots();
  }, [slots, filters]);

  // Update current time every second for countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await slotsAPI.getAllSlots();
      // Backend returns: { success: true, data: slots, message: "Slots fetched successfully" }
      const slotsData = response.data?.data || [];
      setSlots(slotsData);

      if (slotsData.length === 0) {
        toast.error("No slots available at the moment");
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      toast.error("Failed to load slots");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSlots = () => {
    let filtered = [...slots];

    if (filters.resource) {
      filtered = filtered.filter((slot) =>
        slot.resource.toLowerCase().includes(filters.resource.toLowerCase()),
      );
    }

    if (filters.date) {
      const filterDate = new Date(filters.date).toDateString();
      filtered = filtered.filter(
        (slot) => new Date(slot.startTime).toDateString() === filterDate,
      );
    }

    filtered.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    setFilteredSlots(filtered);
  };

  const handleHoldSlot = async (slotId: string) => {
    setHoldingSlotId(slotId);

    try {
      await slotsAPI.updateSlot(slotId);
      // Backend returns: { success: true, message: "Slot updated successfully" }
      toast.success("Slot held successfully!");

      // Refresh slots to show updated state
      await fetchSlots();
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
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter Slots
          </CardTitle>
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
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, resource: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="date-filter">Date</Label>
              <Input
                id="date-filter"
                type="date"
                value={filters.date}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slots Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredSlots.length === 0 ? (
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
          {filteredSlots.map((slot) => (
            <Card key={slot.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{slot.resource}</h3>
                  <Badge className={getStateColor(slot.state)}>
                    <div className="flex items-center gap-1">
                      {getStateIcon(slot.state)}
                      {slot.state}
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

                {slot.state === "held" && (
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

                {slot.state === "booked" && (
                  <div className="w-full flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50 py-3 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    <span>Already Booked</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
