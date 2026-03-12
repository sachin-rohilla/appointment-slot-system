"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Calendar,
  Clock,
  Users,
  TrendingUp,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
  myBookings: number;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalSlots: 0,
    availableSlots: 0,
    bookedSlots: 0,
    myBookings: 0,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await slotsAPI.getAllSlots();
        const slots: Slot[] = response.data.data || [];

        const totalSlots = slots.length;
        const availableSlots = slots.filter(
          (s) => s.state === "available",
        ).length;
        const bookedSlots = slots.filter((s) => s.state === "booked").length;
        const myBookings = user?.role === "admin" ? bookedSlots : 0; // We'll update this when we have booking endpoints

        setStats({
          totalSlots,
          availableSlots,
          bookedSlots,
          myBookings,
        });
      } catch (error) {
        console.error("Failed to load stats:", error);
        // Fallback to zeros if API fails
        setStats({
          totalSlots: 0,
          availableSlots: 0,
          bookedSlots: 0,
          myBookings: 0,
        });
      }
    };

    if (user) {
      loadStats();
    }
  }, [user]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          {isAdmin
            ? "Manage appointment slots and view system overview"
            : "View your bookings and available appointment slots"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Total Slots
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {stats.totalSlots}
            </div>
            <p className="text-xs text-blue-700 mt-1">
              All time slots in system
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">
              Available
            </CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {stats.availableSlots}
            </div>
            <p className="text-xs text-green-700 mt-1">Ready to book</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">
              Booked
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {stats.bookedSlots}
            </div>
            <p className="text-xs text-purple-700 mt-1">
              Confirmed appointments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">
              {isAdmin ? "Total Bookings" : "My Bookings"}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {stats.myBookings}
            </div>
            <p className="text-xs text-orange-700 mt-1">
              {isAdmin ? "All user bookings" : "Your appointments"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              {isAdmin
                ? "Create new slots and manage appointments"
                : "Book new appointments and manage your schedule"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAdmin ? (
              <>
                <Link href="/admin/slots/create">
                  <Button className="w-full justify-start" variant="default">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create New Slot
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                </Link>
                <Link href="/admin/slots">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Manage All Slots
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/slots">
                  <Button className="w-full justify-start" variant="default">
                    <Calendar className="h-4 w-4 mr-2" />
                    Browse Available Slots
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                </Link>
                <Link href="/bookings">
                  <Button className="w-full justify-start" variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    View My Bookings
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest appointments and system updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">New slot created</p>
                    <p className="text-xs text-gray-500">Dr. Smith - 2:00 PM</p>
                  </div>
                </div>
                <Badge variant="secondary">Just now</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Appointment booked</p>
                    <p className="text-xs text-gray-500">John Doe - 3:30 PM</p>
                  </div>
                </div>
                <Badge variant="secondary">5m ago</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Slot released</p>
                    <p className="text-xs text-gray-500">
                      Dr. Johnson - 4:00 PM
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">1h ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
