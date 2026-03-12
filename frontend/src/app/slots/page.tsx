"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { slotsAPI } from "@/lib/api";
import { Slot } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function SlotsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    resource: "",
    date: "",
  });

  const resources = [
    "All Resources",
    "Dr. Smith",
    "Dr. Johnson",
    "Dr. Williams",
    "Dr. Brown",
    "Dr. Davis",
    "Dr. Miller",
  ];

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchSlots();
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    filterSlots();
  }, [slots, filters]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await slotsAPI.getAllSlots();
      setSlots(response.data.data || []);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to fetch slots";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const filterSlots = () => {
    let filtered = [...slots];

    if (filters.resource && filters.resource !== "All Resources") {
      filtered = filtered.filter((slot) => slot.resource === filters.resource);
    }

    if (filters.date) {
      const filterDate = new Date(filters.date).toDateString();
      filtered = filtered.filter(
        (slot) => new Date(slot.startTime).toDateString() === filterDate,
      );
    }

    // Sort by start time
    filtered.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    setFilteredSlots(filtered);
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

  const getStateText = (state: string) => {
    switch (state) {
      case "available":
        return "Available";
      case "booked":
        return "Booked";
      case "held":
        return "Held";
      default:
        return state;
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
        <p className="text-gray-600">
          Browse and book appointment slots with our healthcare providers
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Slots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resource-filter">Resource</Label>
              <Select
                value={filters.resource}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, resource: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select resource" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((resource) => (
                    <SelectItem key={resource} value={resource}>
                      {resource}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-filter">Date</Label>
              <Input
                id="date-filter"
                type="date"
                value={filters.date}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, date: e.target.value }))
                }
                min={new Date().toISOString().split("T")[0]}
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
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{slot.resource}</CardTitle>
                  <Badge className={getStateColor(slot.state)}>
                    {getStateText(slot.state)}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(slot.startTime), "EEEE, MMMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {format(new Date(slot.startTime), "h:mm a")} -{" "}
                  {format(new Date(slot.endTime), "h:mm a")}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  Duration:{" "}
                  {Math.round(
                    (new Date(slot.endTime).getTime() -
                      new Date(slot.startTime).getTime()) /
                      (1000 * 60),
                  )}{" "}
                  minutes
                </div>

                {slot.state === "available" && (
                  <div className="w-full flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 py-2 rounded-md">
                    <CheckCircle className="h-4 w-4" />
                    Available for Booking
                  </div>
                )}

                {slot.state === "booked" && (
                  <div className="w-full flex items-center justify-center gap-2 text-sm text-red-600">
                    <CheckCircle className="h-4 w-4" />
                    Already Booked
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
