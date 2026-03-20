"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { slotsAPI } from "@/lib/api";
import { Slot } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  User,
  Search,
  Filter,
  Trash2,
  RotateCcw,
  Trash,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function RecycleBinPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [deletedSlots, setDeletedSlots] = useState<Slot[]>([]);
  const [filteredDeletedSlots, setFilteredDeletedSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [restoring, setRestoring] = useState(false);
  const [deletingPermanent, setDeletingPermanent] = useState(false);
  const [filters, setFilters] = useState({
    resource: "",
  });

  const resources = [
    "All Resources",
    "Conference Room A",
    "Conference Room B",
    "Service Desk",
    "Meeting Room 1",
    "Meeting Room 2",
  ];

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchDeletedSlots();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    filterAndSearchDeletedSlots();
  }, [deletedSlots, searchTerm, filters]);

  const fetchDeletedSlots = async () => {
    try {
      setLoading(true);
      const response = await slotsAPI.getDeletedSlots();
      setDeletedSlots(response.data.data || []);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to fetch deleted slots";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSearchDeletedSlots = () => {
    let filtered = [...deletedSlots];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter((slot) =>
        slot.resource.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply filters
    if (filters.resource && filters.resource !== "All Resources") {
      filtered = filtered.filter((slot) => slot.resource === filters.resource);
    }

    // Sort by deletion date (most recent first)
    filtered.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    setFilteredDeletedSlots(filtered);
  };

  const handleRestoreSlot = async (slotId: string) => {
    if (
      !confirm(
        "Are you sure you want to restore this slot? It will be available for booking again.",
      )
    ) {
      return;
    }

    try {
      setRestoring(true);
      await slotsAPI.undoSlots([slotId]);
      toast.success("Slot restored successfully!");
      fetchDeletedSlots(); // Refresh deleted slots
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to restore slot";
      toast.error(message);
    } finally {
      setRestoring(false);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedSlots.length === 0) {
      toast.error("Please select slots to restore");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to restore ${selectedSlots.length} slot(s)? They will be available for booking again.`,
      )
    ) {
      return;
    }

    try {
      setRestoring(true);
      await slotsAPI.undoSlots(selectedSlots);
      toast.success(`${selectedSlots.length} slot(s) restored successfully!`);
      setSelectedSlots([]);
      fetchDeletedSlots(); // Refresh deleted slots
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to restore slots";
      toast.error(message);
    } finally {
      setRestoring(false);
    }
  };

  const handleDeletePermanentSlot = async (slotId: string) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this slot? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setDeletingPermanent(true);
      await slotsAPI.deleteSlotsPermanent([slotId]);
      toast.success("Slot deleted permanently successfully!");
      fetchDeletedSlots(); // Refresh deleted slots
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to delete slot permanently";
      toast.error(message);
    } finally {
      setDeletingPermanent(false);
    }
  };

  const handleBulkDeletePermanent = async () => {
    if (selectedSlots.length === 0) {
      toast.error("Please select slots to delete permanently");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to permanently delete ${selectedSlots.length} slot(s)? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setDeletingPermanent(true);
      await slotsAPI.deleteSlotsPermanent(selectedSlots);
      toast.success(`${selectedSlots.length} slot(s) deleted permanently!`);
      setSelectedSlots([]);
      fetchDeletedSlots(); // Refresh deleted slots
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to delete slots permanently";
      toast.error(message);
    } finally {
      setDeletingPermanent(false);
    }
  };

  const handleSelectSlot = (slotId: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId],
    );
  };

  const handleSelectAll = () => {
    if (selectedSlots.length === filteredDeletedSlots.length) {
      setSelectedSlots([]);
    } else {
      setSelectedSlots(filteredDeletedSlots.map((slot) => slot.id));
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Trash2 className="h-8 w-8 text-red-600" />
            Recycle Bin
          </h1>
          <p className="text-gray-600">
            View and restore deleted appointment slots
          </p>
        </div>
        <Link href="/admin/slots">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Back to Slots
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900">
              Deleted Slots
            </CardTitle>
            <Trash2 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {deletedSlots.length}
            </div>
            <p className="text-xs text-red-700">Slots in recycle bin</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">
              Deleted Today
            </CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {
                deletedSlots.filter(
                  (slot) =>
                    new Date(slot.updatedAt).toDateString() ===
                    new Date().toDateString(),
                ).length
              }
            </div>
            <p className="text-xs text-orange-700">Deleted today</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Selected for Restore
            </CardTitle>
            <RotateCcw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {selectedSlots.length}
            </div>
            <p className="text-xs text-blue-700">Slots to restore</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by resource..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource-filter">Resource</Label>
              <select
                id="resource-filter"
                value={filters.resource}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, resource: e.target.value }))
                }
                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {resources.map((resource) => (
                  <option key={resource} value={resource}>
                    {resource}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedSlots.length > 0 && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedSlots.length} slot(s) selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSlots([])}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleBulkRestore}
                  disabled={restoring}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {restoring ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Restoring...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Restore Selected
                    </div>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDeletePermanent}
                  disabled={deletingPermanent}
                  className="bg-red-800 hover:bg-red-900"
                >
                  {deletingPermanent ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Trash className="h-4 w-4" />
                      Delete Permanently
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deleted Slots Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredDeletedSlots.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trash2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No deleted slots found
            </h3>
            <p className="text-gray-600">
              {searchTerm || filters.resource
                ? "Try adjusting your search or filters"
                : "The recycle bin is empty."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center gap-2 hover:text-gray-700"
                    >
                      {selectedSlots.length === filteredDeletedSlots.length &&
                      filteredDeletedSlots.length > 0 ? (
                        <div className="w-4 h-4 bg-blue-600 rounded" />
                      ) : (
                        <div className="w-4 h-4 border border-gray-300 rounded" />
                      )}
                      <span>Select All</span>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Original Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deleted On
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeletedSlots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-gray-50 opacity-75">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleSelectSlot(slot.id)}
                        className="flex items-center"
                      >
                        {selectedSlots.includes(slot.id) ? (
                          <div className="w-4 h-4 bg-blue-600 rounded" />
                        ) : (
                          <div className="w-4 h-4 border border-gray-300 rounded" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {slot.resource}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(slot.startTime), "MMM d, yyyy")}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(slot.startTime), "h:mm a")} -{" "}
                        {format(new Date(slot.endTime), "h:mm a")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {Math.round(
                          (new Date(slot.endTime).getTime() -
                            new Date(slot.startTime).getTime()) /
                            (1000 * 60),
                        )}{" "}
                        min
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(slot.updatedAt), "MMM d, yyyy")}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(slot.updatedAt), "h:mm a")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreSlot(slot.id)}
                          disabled={restoring}
                          className="text-blue-600 hover:text-blue-700 hover:border-blue-300"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePermanentSlot(slot.id)}
                          disabled={deletingPermanent}
                          className="text-red-800 hover:text-red-900 hover:border-red-400"
                          title="Delete Permanently (cannot be undone)"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
