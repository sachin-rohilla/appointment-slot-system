"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { slotsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, ArrowLeft, PlusCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CreateSlotPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    resource: "",
    startTime: "",
    endTime: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const { resource, startTime, endTime } = formData;

    if (!resource) {
      toast.error("Please select a resource");
      return false;
    }

    if (!startTime) {
      toast.error("Please select a start time");
      return false;
    }

    if (!endTime) {
      toast.error("Please select an end time");
      return false;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      toast.error("End time must be after start time");
      return false;
    }

    // Removed validation for future time - allow today's slots

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert datetime-local to ISO string
      const startTimeISO = new Date(formData.startTime).toISOString();
      const endTimeISO = new Date(formData.endTime).toISOString();

      await slotsAPI.createSlot({
        resource: formData.resource,
        startTime: startTimeISO,
        endTime: endTimeISO,
      });

      toast.success("Slot created successfully!");
      router.push("/admin/slots");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to create slot";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/admin/slots"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Slots
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Slot
        </h1>
        <p className="text-gray-600">
          Add a new appointment slot for patients to book
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Slot Details
          </CardTitle>
          <CardDescription>
            Fill in the information below to create a new appointment slot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resource">Resource Name</Label>
              <Input
                id="resource"
                type="text"
                placeholder="Enter resource name (e.g., Conference Room A, Service Desk, etc.)"
                value={formData.resource}
                onChange={(e) => handleInputChange("resource", e.target.value)}
                className="h-11"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    handleInputChange("startTime", e.target.value)
                  }
                  min={new Date(Date.now() + 60 * 60 * 1000)
                    .toISOString()
                    .slice(0, 16)}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  min={
                    formData.startTime ||
                    new Date(Date.now() + 60 * 60 * 1000)
                      .toISOString()
                      .slice(0, 16)
                  }
                  className="h-11"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Tips for creating slots:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Set start and end times at least 1 hour from now</li>
                    <li>
                      Consider the typical duration of your resource's bookings
                    </li>
                    <li>Leave buffer time between consecutive bookings</li>
                    <li>Double-check the date and time before submitting</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Slot...
                  </div>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Slot
                  </>
                )}
              </Button>

              <Link href="/admin/slots">
                <Button type="button" variant="outline" className="h-11">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
