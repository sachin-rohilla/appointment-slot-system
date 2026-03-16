"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { bookingsAPI } from "@/lib/api";
import { Booking } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, X, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function BookingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated, isLoading]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getUserBookings();
      // Backend returns: { success: true, data: bookings, message: "Bookings retrieved successfully" }
      const bookingsData = response.data?.data || [];
      setBookings(bookingsData);
    } catch (error: unknown) {
      console.error("Error fetching bookings:", error);
      const message =
        (error as any)?.response?.data?.message || "Failed to fetch bookings";
      setError(message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingBookingId(bookingId);

    try {
      await bookingsAPI.cancelBooking(bookingId);
      toast.success("Booking cancelled successfully!");
      fetchBookings(); // Refresh bookings
    } catch (error: unknown) {
      const message =
        (error as any)?.response?.data?.message || "Failed to cancel booking";
      toast.error(message);
    } finally {
      setCancellingBookingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "cancelled":
        return "Cancelled";
      case "expired":
        return "Expired";
      default:
        return status;
    }
  };

  const isUpcoming = (startTime: string) => {
    return new Date(startTime) > new Date();
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(
    (booking) =>
      booking.status === "confirmed" &&
      booking.slot &&
      isUpcoming(booking.slot.startTime),
  );

  const pastBookings = bookings.filter(
    (booking) =>
      booking.status === "cancelled" ||
      booking.status === "expired" ||
      (booking.slot && !isUpcoming(booking.slot.startTime)),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">
          View and manage your upcoming and past appointments
        </p>
      </div>

      {/* Upcoming Bookings */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Upcoming Appointments
        </h2>

        {upcomingBookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No upcoming appointments
              </h3>
              <p className="text-gray-600 mb-4">
                You don't have any upcoming appointments scheduled.
              </p>
              <Button
                onClick={() => (window.location.href = "/slots")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Browse Available Slots
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingBookings.map((booking) => (
              <Card
                key={booking.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {booking.slot.resource}
                    </CardTitle>
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusText(booking.status)}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(
                      new Date(booking.slot.startTime),
                      "EEEE, MMMM d, yyyy",
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {format(new Date(booking.slot.startTime), "h:mm a")} -{" "}
                    {format(new Date(booking.slot.endTime), "h:mm a")}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    Duration:{" "}
                    {Math.round(
                      (new Date(booking.slot.endTime).getTime() -
                        new Date(booking.slot.startTime).getTime()) /
                        (1000 * 60),
                    )}{" "}
                    minutes
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Booking Information</p>
                        <p className="text-blue-700">
                          Booking ID: {booking.id.slice(0, 8)}
                        </p>
                        <p className="text-blue-700">
                          Booked on:{" "}
                          {format(new Date(booking.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={cancellingBookingId === booking.id}
                    variant="outline"
                    className="w-full"
                  >
                    {cancellingBookingId === booking.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                        Cancelling...
                      </div>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Cancel Booking
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Past Appointments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastBookings.map((booking) => (
              <Card key={booking.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {booking.slot.resource}
                    </CardTitle>
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusText(booking.status)}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(
                      new Date(booking.slot.startTime),
                      "EEEE, MMMM d, yyyy",
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {format(new Date(booking.slot.startTime), "h:mm a")} -{" "}
                    {format(new Date(booking.slot.endTime), "h:mm a")}
                  </div>

                  <div className="text-sm text-gray-500">
                    {booking.status === "cancelled"
                      ? "This appointment was cancelled."
                      : "This appointment has already taken place."}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
