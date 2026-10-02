"use client";

import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { CarListing, CarImage, CarStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Car,
  Copy,
  Edit,
  Eye,
  Loader2,
  Lock,
  MoreVertical,
  PlusCircle,
  Search,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatKm } from "@/lib/utils/formatters";

export type CarWithImages = CarListing & {
  images: CarImage[];
};

interface InventoryTableProps {
  initialCars: CarWithImages[];
}

export function InventoryTable({ initialCars }: InventoryTableProps) {
  const router = useRouter();
  const [data, setData] = useState<CarWithImages[]>(initialCars);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [brandFilter, setBrandFilter] = useState<string>("ALL");
  const [rowSelection, setRowSelection] = useState({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<CarWithImages | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  // Distinct brands for filter dropdown
  const brands = useMemo(() => {
    const set = new Set<string>();
    initialCars.forEach((c) => set.add(c.brand));
    return Array.from(set).sort();
  }, [initialCars]);

  // Status counts for filter chips
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: initialCars.length,
      LIVE: 0,
      DRAFT: 0,
      RESERVED: 0,
      SOLD: 0,
      ARCHIVED: 0,
    };
    initialCars.forEach((c) => {
      if (counts[c.status] !== undefined) {
        counts[c.status] = (counts[c.status] || 0) + 1;
      }
    });
    return counts;
  }, [initialCars]);

  // Sync state if initialCars updates
  React.useEffect(() => {
    setData(initialCars);
  }, [initialCars]);

  // Row Quick Actions
  const handleStatusChange = useCallback(
    async (carId: string, newStatus: CarStatus) => {
      setActionLoading(carId);
      try {
        const res = await fetch("/api/admin/cars", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: [carId], status: newStatus }),
        });
        if (!res.ok) throw new Error("Status update failed");
        router.refresh();
      } catch (err) {
        console.error(err);
        alert("Failed to update status");
      } finally {
        setActionLoading(null);
      }
    },
    [router]
  );

  const handleDuplicate = useCallback(
    async (carId: string) => {
      setActionLoading(carId);
      try {
        const res = await fetch(`/api/admin/cars/${carId}/duplicate`, {
          method: "POST",
        });
        if (!res.ok) throw new Error("Duplication failed");
        router.refresh();
      } catch (err) {
        console.error(err);
        alert("Failed to duplicate car");
      } finally {
        setActionLoading(null);
      }
    },
    [router]
  );

  const confirmDeleteSingle = useCallback((car: CarWithImages) => {
    setCarToDelete(car);
    setIsBulkDelete(false);
    setDeleteModalOpen(true);
  }, []);

  const confirmDeleteBulk = () => {
    setIsBulkDelete(true);
    setCarToDelete(null);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    setActionLoading("delete");
    try {
      if (isBulkDelete) {
        const selectedIndices = Object.keys(rowSelection).map(Number);
        const selectedIds = selectedIndices
          .map((idx) => table.getRowModel().rows[idx]?.original.id)
          .filter(Boolean) as string[];

        const res = await fetch("/api/admin/cars", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds }),
        });
        if (!res.ok) throw new Error("Bulk delete failed");
        setRowSelection({});
      } else if (carToDelete) {
        const res = await fetch(`/api/admin/cars/${carToDelete.id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Delete failed");
      }

      setDeleteModalOpen(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete car listing");
    } finally {
      setActionLoading(null);
    }
  };

  // Bulk Status Update
  const handleBulkStatusChange = async (newStatus: CarStatus) => {
    const selectedIndices = Object.keys(rowSelection).map(Number);
    const selectedIds = selectedIndices
      .map((idx) => table.getRowModel().rows[idx]?.original.id)
      .filter(Boolean) as string[];

    if (selectedIds.length === 0) return;

    setActionLoading("bulkStatus");
    try {
      const res = await fetch("/api/admin/cars", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, status: newStatus }),
      });
      if (!res.ok) throw new Error("Bulk status update failed");
      setRowSelection({});
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update selected vehicles");
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter((car) => {
      // Status filter
      if (statusFilter !== "ALL" && car.status !== statusFilter) {
        return false;
      }
      // Brand filter
      if (brandFilter !== "ALL" && (car.brand || "").toLowerCase() !== brandFilter.toLowerCase()) {
        return false;
      }
      // Global Search
      if (globalFilter.trim()) {
        const query = globalFilter.toLowerCase().trim();
        const matchTitle = (car.title || "").toLowerCase().includes(query);
        const matchBrand = (car.brand || "").toLowerCase().includes(query);
        const matchModel = (car.model || "").toLowerCase().includes(query);
        const matchPlate = (car.registrationNumber || "").toLowerCase().includes(query);
        const matchVariant = (car.variant || "").toLowerCase().includes(query);
        if (!matchTitle && !matchBrand && !matchModel && !matchPlate && !matchVariant) {
          return false;
        }
      }
      return true;
    });
  }, [data, statusFilter, brandFilter, globalFilter]);

  // TanStack Columns Definition
  const columns = useMemo<ColumnDef<CarWithImages>[]>(
    () => [
      // Select Checkbox
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
            aria-label="Select all"
            className="size-4 rounded border-slate-300 bg-white text-primary focus:ring-primary accent-primary cursor-pointer"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(e.target.checked)}
            aria-label="Select row"
            className="size-4 rounded border-slate-300 bg-white text-primary focus:ring-primary accent-primary cursor-pointer"
          />
        ),
        enableSorting: false,
      },

      // Vehicle (Image + Title + Admin Plate)
      {
        accessorKey: "title",
        header: "Vehicle Details",
        cell: ({ row }) => {
          const car = row.original;
          return (
            <div className="flex items-center gap-3.5 min-w-[280px]">
              <div className="relative size-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                <Image
                  src={car.coverImage || "/images/placeholder-car.jpg"}
                  alt={car.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized
                />
                {car.images?.length > 1 && (
                  <span className="absolute bottom-1 right-1 bg-black/75 text-[9px] px-1 py-0.2 rounded text-white font-mono">
                    +{car.images.length - 1}
                  </span>
                )}
              </div>

              <div className="space-y-1 overflow-hidden">
                <Link
                  href={`/admin/inventory/${car.id}/edit`}
                  className="font-bold text-sm text-slate-900 hover:text-primary transition-colors line-clamp-1 block"
                >
                  {car.title}
                </Link>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {car.variant}
                  </span>

                  {/* Sensitive Admin-Only Plate Badge */}
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-mono text-[10px] font-bold">
                    <Lock className="size-2.5" />
                    {car.registrationNumber}
                  </span>
                </div>

                {/* Badges for Featured / New Arrival */}
                <div className="flex items-center gap-1.5">
                  {car.isFeatured && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-semibold">
                      <Star className="size-2.5 fill-amber-500 text-amber-500" /> Featured
                    </span>
                  )}
                  {car.isNewArrival && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                      <Sparkles className="size-2.5 text-emerald-500" /> New Arrival
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },

      // Brand & Body
      {
        accessorKey: "brand",
        header: "Brand & Body",
        cell: ({ row }) => {
          const car = row.original;
          return (
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 block">{car.brand}</span>
              <Badge variant="outline" className="text-[10px] bg-slate-50 border-slate-200 text-slate-700">
                {car.bodyType}
              </Badge>
            </div>
          );
        },
      },

      // Specs (Year / Fuel / Trans / KM)
      {
        id: "specs",
        header: "Specs & KM",
        cell: ({ row }) => {
          const car = row.original;
          return (
            <div className="text-xs space-y-0.5 text-slate-700">
              <p className="font-semibold text-slate-900">
                {car.manufacturingYear} • {car.fuelType}
              </p>
              <p className="text-[11px] text-slate-500">
                {car.transmission} • {formatKm(car.kmDriven)}
              </p>
            </div>
          );
        },
      },

      // Price & Discount
      {
        accessorKey: "price",
        header: "Pricing",
        cell: ({ row }) => {
          const car = row.original;
          return (
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-slate-900 font-mono">
                {formatCurrency(car.discountedPrice || car.price)}
              </p>
              {car.discountedPrice && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 line-through font-mono">
                    {formatCurrency(car.price)}
                  </span>
                  {car.discountPercent && (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] px-1 py-0">
                      {car.discountPercent}% OFF
                    </Badge>
                  )}
                </div>
              )}
            </div>
          );
        },
      },

      // Status Badge
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide",
                status === "LIVE" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                status === "DRAFT" && "bg-slate-100 text-slate-700 border-slate-200",
                status === "RESERVED" && "bg-amber-50 text-amber-700 border-amber-200",
                status === "SOLD" && "bg-purple-50 text-purple-700 border-purple-200",
                status === "ARCHIVED" && "bg-rose-50 text-rose-700 border-rose-200"
              )}
            >
              {status}
            </Badge>
          );
        },
      },

      // Added On Date
      {
        accessorKey: "createdAt",
        id: "createdAt",
        header: "Added On",
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return (
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              {date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          );
        },
      },

      // Actions Column
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const car = row.original;
          const isLoading = actionLoading === car.id;

          return (
            <div className="text-right">
              {isLoading ? (
                <Loader2 className="size-4 animate-spin text-slate-400 inline" />
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                    >
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white border-slate-200 text-slate-900 shadow-xl">
                    <DropdownMenuLabel>Vehicle Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/inventory/${car.id}/edit`} className="flex items-center gap-2">
                        <Edit className="size-3.5 text-primary" />
                        <span>Edit Vehicle</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href={`/cars/${car.slug}`} target="_blank" className="flex items-center gap-2">
                        <Eye className="size-3.5 text-blue-600" />
                        <span>View Public Page</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => handleDuplicate(car.id)}
                      className="flex items-center gap-2"
                    >
                      <Copy className="size-3.5 text-amber-600" />
                      <span>Duplicate as Draft</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    <DropdownMenuItem
                      disabled={car.status === "LIVE"}
                      onClick={() => handleStatusChange(car.id, "LIVE")}
                      className="text-emerald-700"
                    >
                      Mark as LIVE
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={car.status === "DRAFT"}
                      onClick={() => handleStatusChange(car.id, "DRAFT")}
                    >
                      Move to DRAFT
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={car.status === "RESERVED"}
                      onClick={() => handleStatusChange(car.id, "RESERVED")}
                      className="text-amber-700"
                    >
                      Mark as RESERVED
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={car.status === "SOLD"}
                      onClick={() => handleStatusChange(car.id, "SOLD")}
                      className="text-purple-700"
                    >
                      Mark as SOLD
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => confirmDeleteSingle(car)}
                      className="text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="size-3.5 mr-2" />
                      <span>Delete Vehicle</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        },
      },
    ],
    [actionLoading, handleDuplicate, handleStatusChange, confirmDeleteSingle]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="space-y-6 text-slate-900">
      {/* Top Bar: Title & Add Vehicle Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Car className="size-5 text-primary" />
            Inventory Management
          </h2>
          <p className="text-xs text-slate-500">
            View, filter, edit, and publish certified showroom stock with full specs and admin RTO plates.
          </p>
        </div>

        <Button
          asChild
          className="bg-primary hover:bg-rose-600 text-white font-bold px-4 h-10 rounded-xl shadow-md shadow-primary/25 cursor-pointer shrink-0 gap-2"
        >
          <Link href="/admin/inventory/new">
            <PlusCircle className="size-4" />
            <span>Add New Car</span>
          </Link>
        </Button>
      </div>

      {/* Filter Chips Bar (Statuses) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(["ALL", "LIVE", "DRAFT", "RESERVED", "SOLD", "ARCHIVED"] as const).map((st) => {
          const isActive = statusFilter === st;
          const count = statusCounts[st] || 0;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer",
                isActive
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <span>{st === "ALL" ? "All Cars" : st}</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px]",
                  isActive ? "bg-white text-primary font-bold" : "bg-slate-100 text-slate-600"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Secondary Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="size-4 text-slate-400 absolute left-3 top-3" />
          <Input
            placeholder="Search by title, brand, plate..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-10 rounded-xl focus-visible:ring-primary"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter("")}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Brand Dropdown & Clear Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="h-10 rounded-xl bg-white border border-slate-200 text-slate-900 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Brands ({brands.length})</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {(statusFilter !== "ALL" || brandFilter !== "ALL" || globalFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter("ALL");
                setBrandFilter("ALL");
                setGlobalFilter("");
              }}
              className="text-xs text-slate-500 hover:text-slate-900 h-10"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Actions Floating Toolbar */}
      {selectedCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-3 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="size-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
              {selectedCount}
            </span>
            <span className="text-xs font-bold text-rose-950">
              {selectedCount === 1 ? "1 vehicle selected" : `${selectedCount} vehicles selected`}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusChange("LIVE")}
              disabled={!!actionLoading}
              className="border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs h-8"
            >
              Publish (LIVE)
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusChange("DRAFT")}
              disabled={!!actionLoading}
              className="border-slate-300 bg-slate-200 text-slate-800 hover:bg-slate-300 text-xs h-8"
            >
              Move to DRAFT
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusChange("ARCHIVED")}
              disabled={!!actionLoading}
              className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-xs h-8"
            >
              Archive
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={confirmDeleteBulk}
              disabled={!!actionLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8"
            >
              <Trash2 className="size-3.5 mr-1" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* TanStack Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-slate-200 bg-slate-50/80">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-600"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-slate-400 text-sm">
                    No vehicles match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "hover:bg-slate-50/80 transition-colors",
                      row.getIsSelected() && "bg-primary/5"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 bg-white">
          <div>
            Showing{" "}
            <span className="font-bold text-slate-900">
              {table.getRowModel().rows.length}
            </span>{" "}
            of <span className="font-bold text-slate-900">{filteredData.length}</span> vehicles
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs h-8"
            >
              Previous
            </Button>

            <span className="text-slate-600 px-2">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {Math.max(1, table.getPageCount())}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs h-8"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="bg-white border-slate-200 text-slate-900 sm:max-w-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trash2 className="size-5 text-rose-600" />
              {isBulkDelete
                ? `Confirm Deletion of ${selectedCount} Vehicles`
                : `Delete ${carToDelete?.title}?`}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs pt-1">
              This action permanently deletes the vehicle listing and its photo associations from the database. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteModalOpen(false)}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={executeDelete}
              disabled={actionLoading === "delete"}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {actionLoading === "delete" ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Confirm Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
