"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  carFormSchema,
  CarFormData,
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  OWNER_TYPES,
  INSURANCE_STATUSES,
  CAR_STATUSES,
  POPULAR_BRANDS,
  PRESET_HIGHLIGHT_TAGS,
} from "@/lib/validations/car";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  Check,
  ChevronLeft,
  Loader2,
  Lock,
  Plus,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
  X,
  AlertCircle,
  Cloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getOptimizedImageUrl, compressImageClient } from "@/lib/utils/image";

interface CarFormProps {
  initialData?: Partial<CarFormData> & { id?: string };
  mode: "create" | "edit";
}

export function CarForm({ initialData, mode }: CarFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState("Uploading photos to Cloudinary...");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const defaultValues: Partial<CarFormData> = {
    title: initialData?.title || "",
    brand: initialData?.brand || "",
    model: initialData?.model || "",
    variant: initialData?.variant || "",
    bodyType: initialData?.bodyType || "SEDAN",
    manufacturingYear: initialData?.manufacturingYear || new Date().getFullYear() - 3,
    registrationYear: initialData?.registrationYear || new Date().getFullYear() - 3,
    registrationState: initialData?.registrationState || "MP",
    registrationNumber: initialData?.registrationNumber || "",
    ownerType: initialData?.ownerType || "FIRST",
    kmDriven: initialData?.kmDriven || 25000,
    fuelType: initialData?.fuelType || "PETROL",
    transmission: initialData?.transmission || "MANUAL",
    colour: initialData?.colour || "",
    insuranceStatus: initialData?.insuranceStatus || "COMPREHENSIVE",
    insuranceValidTill: initialData?.insuranceValidTill
      ? new Date(initialData.insuranceValidTill).toISOString().split("T")[0]
      : "",
    price: initialData?.price || 650000,
    discountedPrice: initialData?.discountedPrice || null,
    description: initialData?.description || "",
    highlightTags: initialData?.highlightTags || [
      "150+ Checkpoints Certified",
      "Single Owner",
    ],
    status: initialData?.status || "LIVE",
    isFeatured: initialData?.isFeatured ?? false,
    isNewArrival: initialData?.isNewArrival ?? true,
    coverImage: initialData?.coverImage || "",
    images: initialData?.images?.length
      ? initialData.images
      : initialData?.coverImage
      ? [{ url: initialData.coverImage, isCover: true }]
      : [],
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CarFormData>({
    resolver: zodResolver(carFormSchema),
    defaultValues: defaultValues as CarFormData,
  });

  const watchedPrice = watch("price") || 0;
  const watchedDiscountedPrice = watch("discountedPrice");
  const watchedImages = watch("images") || [];
  const watchedCoverImage = watch("coverImage") || "";
  const watchedTags = watch("highlightTags") || [];
  const watchedBrand = watch("brand") || "";
  const watchedStatus = watch("status");

  // Calculate discount percentage
  const discountPercent =
    watchedDiscountedPrice && watchedPrice > watchedDiscountedPrice
      ? Math.round(((watchedPrice - watchedDiscountedPrice) / watchedPrice) * 100)
      : null;

  // Add Image Handler
  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;

    try {
      new URL(newImageUrl.trim());
    } catch {
      alert("Please enter a valid HTTP or HTTPS image URL");
      return;
    }

    const currentImages = [...watchedImages];
    const isFirst = currentImages.length === 0;
    const newImage = {
      url: newImageUrl.trim(),
      isCover: isFirst,
    };

    currentImages.push(newImage);
    setValue("images", currentImages, { shouldValidate: true });

    if (isFirst || !watchedCoverImage) {
      setValue("coverImage", newImageUrl.trim(), { shouldValidate: true });
    }

    setNewImageUrl("");
  };

  // Set Cover Image Handler
  const handleSetCover = (url: string) => {
    setValue("coverImage", url, { shouldValidate: true });
    const updatedImages = watchedImages.map((img) => ({
      ...img,
      isCover: img.url === url,
    }));
    setValue("images", updatedImages, { shouldValidate: true });
  };

  // Remove Image Handler
  const handleRemoveImage = (indexToRemove: number) => {
    const updatedImages = watchedImages.filter((_, idx) => idx !== indexToRemove);
    setValue("images", updatedImages, { shouldValidate: true });

    // If we removed the cover image, set the first remaining image as cover
    if (watchedImages[indexToRemove]?.url === watchedCoverImage) {
      const firstUrl = updatedImages[0]?.url || "";
      setValue("coverImage", firstUrl, { shouldValidate: true });
      if (updatedImages[0]) {
        updatedImages[0].isCover = true;
        setValue("images", [...updatedImages], { shouldValidate: true });
      }
    }
  };

  // Cloudinary File Upload Handler (with Ultra-Fast Client-Side Compression)
  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const fileArray = Array.from(files);

    // Validate size limit (up to 25MB raw file before client compression)
    const oversized = fileArray.filter((f) => f.size > 25 * 1024 * 1024);
    if (oversized.length > 0) {
      setUploadError(`The following file(s) exceed the 25MB limit: ${oversized.map((f) => f.name).join(", ")}`);
      setIsUploading(false);
      return;
    }

    try {
      // Step 1: Ultra-fast client-side compression (reduces 10MB to ~250KB in <100ms)
      setUploadStatusText(`Optimizing & compressing ${fileArray.length} photo${fileArray.length > 1 ? "s" : ""}...`);
      const compressedFiles = await Promise.all(
        fileArray.map((file) =>
          compressImageClient(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.85 })
        )
      );

      // Step 2: Upload optimized files to Cloudinary API
      setUploadStatusText(`Uploading ${compressedFiles.length} photo${compressedFiles.length > 1 ? "s" : ""} to Cloudinary...`);
      const formData = new FormData();
      compressedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image(s)");
      }

      if (data.uploaded && Array.isArray(data.uploaded)) {
        const currentImages = [...watchedImages];
        const newImgs = data.uploaded.map((item: { url: string }, idx: number) => ({
          url: item.url,
          isCover: currentImages.length === 0 && idx === 0,
        }));

        const updated = [...currentImages, ...newImgs];
        setValue("images", updated, { shouldValidate: true });

        if (!watchedCoverImage && updated[0]) {
          setValue("coverImage", updated[0].url, { shouldValidate: true });
        }

        setUploadSuccess(
          `⚡ Fast upload complete! Added ${data.uploaded.length} optimized photo${data.uploaded.length > 1 ? "s" : ""} to Cloudinary.`
        );
        setTimeout(() => setUploadSuccess(null), 4000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error uploading to Cloudinary";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
      setUploadStatusText("Uploading photos to Cloudinary...");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Add Custom Tag Handler
  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed || watchedTags.includes(trimmed)) return;
    setValue("highlightTags", [...watchedTags, trimmed], { shouldValidate: true });
    setCustomTag("");
  };

  // Remove Tag Handler
  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      "highlightTags",
      watchedTags.filter((t) => t !== tagToRemove),
      { shouldValidate: true }
    );
  };

  // Form Submit Handler
  const onSubmit = async (data: CarFormData) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const url =
        mode === "create"
          ? "/api/admin/cars"
          : `/api/admin/cars/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to save car listing");
      }

      router.push("/admin/inventory");
      router.refresh();
    } catch (err: unknown) {
      console.error("Submission error:", err);
      setSubmitError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            asChild
            className="border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            <Link href="/admin/inventory">
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Car className="size-5 text-primary" />
              {mode === "create" ? "Create New Car Listing" : `Edit: ${initialData?.title}`}
            </h2>
            <p className="text-xs text-slate-500">
              Fill in all certified specifications, pricing, and high-resolution photos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            asChild
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <Link href="/admin/inventory">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-rose-600 text-white font-bold px-6 shadow-md shadow-primary/25 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Saving...
              </>
            ) : mode === "create" ? (
              <>
                <Plus className="size-4 mr-1.5" />
                Publish Vehicle
              </>
            ) : (
              <>
                <Check className="size-4 mr-1.5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {submitError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle className="size-5 shrink-0 text-rose-500" />
          <span>{submitError}</span>
        </div>
      )}

      {/* SECTION 1: Basic Information & Publishing Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="size-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
              1
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Basic Vehicle Information
              </h3>
              <p className="text-xs text-slate-500">Title, brand, variant, and listing visibility</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="status" className="text-xs text-slate-500 hidden sm:inline">
              Listing Status:
            </Label>
            <select
              id="status"
              {...register("status")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer",
                watchedStatus === "LIVE" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                watchedStatus === "DRAFT" && "bg-slate-100 text-slate-700 border-slate-300",
                watchedStatus === "RESERVED" && "bg-amber-50 text-amber-700 border-amber-200",
                watchedStatus === "SOLD" && "bg-purple-50 text-purple-700 border-purple-200",
                watchedStatus === "ARCHIVED" && "bg-rose-50 text-rose-700 border-rose-200"
              )}
            >
              {CAR_STATUSES.map((st) => (
                <option key={st} value={st} className="bg-white text-slate-900">
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Title */}
          <div className="lg:col-span-2 space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold text-slate-700">
              Listing Headline Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g. 2021 Hyundai Creta SX (O) 1.5 Diesel Automatic"
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-primary text-sm"
              {...register("title")}
            />
            {errors.title && <p className="text-[11px] text-rose-500">{errors.title.message}</p>}
          </div>

          {/* Brand */}
          <div className="space-y-1.5">
            <Label htmlFor="brand" className="text-xs font-semibold text-slate-700">
              Make / Brand *
            </Label>
            <div className="space-y-2">
              <Input
                id="brand"
                placeholder="e.g. Hyundai"
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-primary text-sm"
                {...register("brand")}
              />
              <div className="flex flex-wrap gap-1">
                {POPULAR_BRANDS.slice(0, 5).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setValue("brand", b, { shouldValidate: true })}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer",
                      watchedBrand === b
                        ? "bg-primary text-white border-primary"
                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:text-slate-900"
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            {errors.brand && <p className="text-[11px] text-rose-500">{errors.brand.message}</p>}
          </div>

          {/* Model */}
          <div className="space-y-1.5">
            <Label htmlFor="model" className="text-xs font-semibold text-slate-700">
              Model Name *
            </Label>
            <Input
              id="model"
              placeholder="e.g. Creta"
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-primary text-sm"
              {...register("model")}
            />
            {errors.model && <p className="text-[11px] text-rose-500">{errors.model.message}</p>}
          </div>

          {/* Variant */}
          <div className="space-y-1.5">
            <Label htmlFor="variant" className="text-xs font-semibold text-slate-700">
              Variant / Trim *
            </Label>
            <Input
              id="variant"
              placeholder="e.g. SX (O) 1.5 AT"
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-primary text-sm"
              {...register("variant")}
            />
            {errors.variant && <p className="text-[11px] text-rose-500">{errors.variant.message}</p>}
          </div>

          {/* Body Type */}
          <div className="space-y-1.5">
            <Label htmlFor="bodyType" className="text-xs font-semibold text-slate-700">
              Body Type *
            </Label>
            <select
              id="bodyType"
              {...register("bodyType")}
              className="w-full h-10 rounded-lg bg-white border border-slate-200 text-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {BODY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.bodyType && <p className="text-[11px] text-rose-500">{errors.bodyType.message}</p>}
          </div>

          {/* Promotion Switches */}
          <div className="lg:col-span-2 flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register("isFeatured")}
                className="size-4 rounded border-slate-300 bg-white text-primary focus:ring-primary accent-primary"
              />
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Star className="size-3.5 text-amber-500" />
                Featured Showcase on Homepage
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register("isNewArrival")}
                className="size-4 rounded border-slate-300 bg-white text-primary focus:ring-primary accent-primary"
              />
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-emerald-600" />
                Mark as New Arrival
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 2: Technical Specifications & RTO (Admin-Only Plate) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <span className="size-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
            2
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Technical Specifications & Verification
            </h3>
            <p className="text-xs text-slate-500">RTO details, odometer, ownership, fuel and transmission</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Manufacturing Year */}
          <div className="space-y-1.5">
            <Label htmlFor="manufacturingYear" className="text-xs font-semibold text-slate-700">
              Manufacturing Year *
            </Label>
            <Input
              id="manufacturingYear"
              type="number"
              className="bg-white border-slate-200 text-slate-900 focus-visible:ring-primary text-sm"
              {...register("manufacturingYear")}
            />
            {errors.manufacturingYear && (
              <p className="text-[11px] text-rose-500">{errors.manufacturingYear.message}</p>
            )}
          </div>

          {/* Registration Year */}
          <div className="space-y-1.5">
            <Label htmlFor="registrationYear" className="text-xs font-semibold text-slate-700">
              Registration Year *
            </Label>
            <Input
              id="registrationYear"
              type="number"
              className="bg-white border-slate-200 text-slate-900 focus-visible:ring-primary text-sm"
              {...register("registrationYear")}
            />
            {errors.registrationYear && (
              <p className="text-[11px] text-rose-500">{errors.registrationYear.message}</p>
            )}
          </div>

          {/* Registration State */}
          <div className="space-y-1.5">
            <Label htmlFor="registrationState" className="text-xs font-semibold text-slate-700">
              RTO State Code *
            </Label>
            <Input
              id="registrationState"
              placeholder="e.g. MP or DL"
              maxLength={4}
              className="bg-white border-slate-200 text-slate-900 uppercase focus-visible:ring-primary text-sm"
              {...register("registrationState")}
            />
            {errors.registrationState && (
              <p className="text-[11px] text-rose-500">{errors.registrationState.message}</p>
            )}
          </div>

          {/* Sensitive Registration Number (Admin-Only) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="registrationNumber"
                className="text-xs font-semibold text-rose-700 flex items-center gap-1"
              >
                <Lock className="size-3 text-rose-600" />
                Plate Number (Admin-Only) *
              </Label>
            </div>
            <Input
              id="registrationNumber"
              placeholder="e.g. MP 04 CZ 1234"
              className="bg-rose-50/60 border-rose-200 text-rose-900 placeholder:text-rose-400 uppercase focus-visible:ring-rose-500 text-sm font-mono font-bold"
              {...register("registrationNumber")}
            />
            <p className="text-[10px] text-slate-500">Never exposed to public visitors</p>
            {errors.registrationNumber && (
              <p className="text-[11px] text-rose-500">{errors.registrationNumber.message}</p>
            )}
          </div>

          {/* Owner Type */}
          <div className="space-y-1.5">
            <Label htmlFor="ownerType" className="text-xs font-semibold text-slate-700">
              Ownership Tier *
            </Label>
            <select
              id="ownerType"
              {...register("ownerType")}
              className="w-full h-10 rounded-lg bg-white border border-slate-200 text-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {OWNER_TYPES.map((o) => (
                <option key={o} value={o}>
                  {o === "FIRST" ? "1st Owner" : o === "SECOND" ? "2nd Owner" : o === "THIRD" ? "3rd Owner" : "4th+ Owner"}
                </option>
              ))}
            </select>
          </div>

          {/* Kilometers Driven */}
          <div className="space-y-1.5">
            <Label htmlFor="kmDriven" className="text-xs font-semibold text-slate-700">
              Kilometers Driven *
            </Label>
            <Input
              id="kmDriven"
              type="number"
              placeholder="e.g. 34000"
              className="bg-white border-slate-200 text-slate-900 focus-visible:ring-primary text-sm"
              {...register("kmDriven")}
            />
            {errors.kmDriven && (
              <p className="text-[11px] text-rose-500">{errors.kmDriven.message}</p>
            )}
          </div>

          {/* Fuel Type */}
          <div className="space-y-1.5">
            <Label htmlFor="fuelType" className="text-xs font-semibold text-slate-700">
              Fuel Type *
            </Label>
            <select
              id="fuelType"
              {...register("fuelType")}
              className="w-full h-10 rounded-lg bg-white border border-slate-200 text-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {FUEL_TYPES.map((fuel) => (
                <option key={fuel} value={fuel}>
                  {fuel}
                </option>
              ))}
            </select>
          </div>

          {/* Transmission */}
          <div className="space-y-1.5">
            <Label htmlFor="transmission" className="text-xs font-semibold text-slate-700">
              Transmission *
            </Label>
            <select
              id="transmission"
              {...register("transmission")}
              className="w-full h-10 rounded-lg bg-white border border-slate-200 text-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {TRANSMISSION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Colour */}
          <div className="space-y-1.5">
            <Label htmlFor="colour" className="text-xs font-semibold text-slate-700">
              Exterior Colour *
            </Label>
            <Input
              id="colour"
              placeholder="e.g. Polar White"
              className="bg-white border-slate-200 text-slate-900 focus-visible:ring-primary text-sm"
              {...register("colour")}
            />
            {errors.colour && <p className="text-[11px] text-rose-500">{errors.colour.message}</p>}
          </div>

          {/* Insurance Status */}
          <div className="space-y-1.5">
            <Label htmlFor="insuranceStatus" className="text-xs font-semibold text-slate-700">
              Insurance Status *
            </Label>
            <select
              id="insuranceStatus"
              {...register("insuranceStatus")}
              className="w-full h-10 rounded-lg bg-white border border-slate-200 text-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {INSURANCE_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Insurance Validity Date */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="insuranceValidTill" className="text-xs font-semibold text-slate-700">
              Insurance Validity Date (Optional)
            </Label>
            <Input
              id="insuranceValidTill"
              type="date"
              className="bg-white border-slate-200 text-slate-900 focus-visible:ring-primary text-sm"
              {...register("insuranceValidTill")}
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Pricing & Instant Discount Calculator */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <span className="size-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
            3
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Pricing & Special Offer Deal
            </h3>
            <p className="text-xs text-slate-500">Regular listing price and optional discounted deal price</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {/* Base Price */}
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs font-semibold text-slate-700">
              Base Price (₹ INR) *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-bold">₹</span>
              <Input
                id="price"
                type="number"
                step="1000"
                placeholder="650000"
                className="pl-7 bg-white border-slate-200 text-slate-900 font-mono font-bold focus-visible:ring-primary text-base"
                {...register("price")}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {watchedPrice ? `₹${(watchedPrice / 100000).toFixed(2)} Lakh` : ""}
            </p>
            {errors.price && <p className="text-[11px] text-rose-500">{errors.price.message}</p>}
          </div>

          {/* Discounted Price */}
          <div className="space-y-1.5">
            <Label htmlFor="discountedPrice" className="text-xs font-semibold text-slate-700">
              Discounted Deal Price (₹ INR, Optional)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-bold">₹</span>
              <Input
                id="discountedPrice"
                type="number"
                step="1000"
                placeholder="Leave blank if no discount"
                className="pl-7 bg-white border-slate-200 text-slate-900 font-mono font-bold focus-visible:ring-primary text-base"
                {...register("discountedPrice")}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {watchedDiscountedPrice
                ? `₹${(watchedDiscountedPrice / 100000).toFixed(2)} Lakh`
                : "Standard price will be displayed"}
            </p>
            {errors.discountedPrice && (
              <p className="text-[11px] text-rose-500">{errors.discountedPrice.message}</p>
            )}
          </div>

          {/* Computed Discount Badge Card */}
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
              {discountPercent ? `${discountPercent}%` : "0%"}
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Discount Calculation
              </p>
              <p className="text-xs text-slate-600">
                {discountPercent
                  ? `Savings of ₹${((watchedPrice - (watchedDiscountedPrice || 0))).toLocaleString("en-IN")} applied`
                  : "No active discount configured"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Description & Highlight Tags */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <span className="size-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
            4
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Description & Value Highlights
            </h3>
            <p className="text-xs text-slate-500">Showcase tags and detailed inspection summary</p>
          </div>
        </div>

        {/* Highlight Tags Manager */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-slate-700">
            Certified Highlight Badges
          </Label>

          {/* Active Chips */}
          <div className="flex flex-wrap gap-2 min-h-[36px] p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            {watchedTags.length === 0 ? (
              <span className="text-xs text-slate-400 py-1 px-2">No highlight tags selected yet</span>
            ) : (
              watchedTags.map((tag) => (
                <Badge
                  key={tag}
                  className="bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 py-1 pl-2.5 pr-1.5 flex items-center gap-1.5 text-xs rounded-lg"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-900 cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>

          {/* Add custom tag */}
          <div className="flex gap-2 max-w-md">
            <Input
              placeholder="Type custom highlight..."
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag(customTag);
                }
              }}
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs h-9"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddTag(customTag)}
              className="border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shrink-0 h-9 cursor-pointer"
            >
              Add Tag
            </Button>
          </div>

          {/* Quick Preset Tags */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] text-slate-500">Quick presets (click to add):</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_HIGHLIGHT_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  disabled={watchedTags.includes(tag)}
                  className={cn(
                    "text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer",
                    watchedTags.includes(tag)
                      ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
                  )}
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs font-semibold text-slate-700">
            Showroom Condition & Technical Description *
          </Label>
          <textarea
            id="description"
            rows={5}
            placeholder="Detailed description covering vehicle condition, service records, accessories, non-accidental guarantee, etc."
            className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-400"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-[11px] text-rose-500">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* SECTION 5: Photo Gallery & Cover Image */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="size-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
              5
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Photo Gallery & Cover Photo
              </h3>
              <p className="text-xs text-slate-500">
                Upload vehicle photos to Cloudinary or paste direct links, then designate the primary cover thumbnail
              </p>
            </div>
          </div>
          <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-xs">
            {watchedImages.length} {watchedImages.length === 1 ? "Photo" : "Photos"}
          </Badge>
        </div>

        {/* Cloudinary Drag-and-Drop Uploader Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.005]"
              : "border-slate-300 hover:border-primary/60 bg-slate-50/60 hover:bg-slate-50",
            isUploading && "pointer-events-none opacity-75"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif,image/jpg"
            className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            {isUploading ? (
              <>
                <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center animate-pulse">
                  <Loader2 className="size-6 animate-spin" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">
                    {uploadStatusText}
                  </p>
                  <p className="text-xs text-slate-500">
                    Client-side compression active • Fast upload & WebP delivery
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                  <UploadCloud className="size-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">
                    Click to browse or drag & drop vehicle photos
                  </p>
                  <p className="text-xs text-slate-500">
                    Upload exterior, interior, dashboard, and odometer photos (JPEG, PNG, WebP, AVIF up to 10MB each)
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="bg-primary hover:bg-rose-600 text-white font-bold text-xs pointer-events-none"
                >
                  Choose Images from Device
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Upload Success Banner */}
        {uploadSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="size-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* Upload Error Banner */}
        {uploadError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{uploadError}</p>
              {uploadError.includes("Cloudinary") && (
                <p className="text-[11px] text-rose-700">
                  Tip: Open your project <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">.env</code> file and configure <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">CLOUDINARY_CLOUD_NAME</code>, <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">CLOUDINARY_API_KEY</code>, and <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">CLOUDINARY_API_SECRET</code>. You can also paste direct image URLs below.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Fallback Option: Direct URL Input Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-xs text-slate-600 hover:text-primary font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{showUrlInput ? "− Hide manual image URL input" : "+ Or add photo via direct URL (Unsplash / Hosted)"}</span>
          </button>

          {showUrlInput && (
            <div className="flex flex-col sm:flex-row gap-2 mt-3 animate-in fade-in">
              <Input
                placeholder="Paste public image URL (e.g. https://images.unsplash.com/...)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm"
              />
              <Button
                type="button"
                onClick={handleAddImage}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold shrink-0 cursor-pointer"
              >
                <Plus className="size-4 mr-1.5" />
                Add URL
              </Button>
            </div>
          )}
        </div>

        {errors.images && (
          <p className="text-xs text-rose-500">{errors.images.message}</p>
        )}
        {errors.coverImage && (
          <p className="text-xs text-rose-500">{errors.coverImage.message}</p>
        )}

        {/* Gallery Thumbnails Grid */}
        {watchedImages.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50/70 space-y-2">
            <UploadCloud className="size-10 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-700 font-semibold">No photos added yet</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Upload photos from your computer/mobile above, or paste direct hosted links.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {watchedImages.map((img, idx) => {
              const isCover = img.url === watchedCoverImage;
              return (
                <div
                  key={idx}
                  className={cn(
                    "group relative rounded-xl overflow-hidden border transition-all bg-slate-100 aspect-[4/3]",
                    isCover
                      ? "ring-2 ring-primary border-primary shadow-md"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <Image
                    src={getOptimizedImageUrl(img.url, { width: 400 })}
                    alt={`Car image ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover"
                  />

                  {/* Badges & Actions Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-90 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        {isCover && (
                          <span className="px-1.5 py-0.5 rounded bg-primary text-white text-[10px] font-bold tracking-wider">
                            COVER
                          </span>
                        )}
                        {img.url.includes("cloudinary.com") ? (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-600/90 text-white text-[9px] font-bold flex items-center gap-1 shadow-xs">
                            <Cloud className="size-2.5" />
                            Cloudinary
                          </span>
                        ) : (
                          <span className="text-[10px] text-white/80 font-mono">#{idx + 1}</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="size-6 rounded bg-black/60 text-slate-300 hover:text-rose-400 flex items-center justify-center cursor-pointer transition-colors"
                        title="Remove image"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>

                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(img.url)}
                        className="w-full py-1 rounded bg-black/80 hover:bg-primary text-white text-[10px] font-bold tracking-wide transition-colors cursor-pointer"
                      >
                        Set as Cover
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl">
        <div className="text-xs text-slate-500">
          Status:{" "}
          <span className="font-bold text-slate-900 uppercase">{watchedStatus}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            asChild
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <Link href="/admin/inventory">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-rose-600 text-white font-bold px-8 shadow-lg shadow-primary/30 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Saving...
              </>
            ) : mode === "create" ? (
              "Publish Vehicle"
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
