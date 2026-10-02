import { z } from "zod";

export const BODY_TYPES = [
  "HATCHBACK",
  "SEDAN",
  "SUV",
  "COUPE",
  "CONVERTIBLE",
  "MUV",
  "LUXURY",
] as const;

export const FUEL_TYPES = [
  "PETROL",
  "DIESEL",
  "CNG",
  "ELECTRIC",
  "HYBRID",
] as const;

export const TRANSMISSION_TYPES = [
  "MANUAL",
  "AUTOMATIC",
  "IMT",
] as const;

export const OWNER_TYPES = [
  "FIRST",
  "SECOND",
  "THIRD",
  "FOURTH_PLUS",
] as const;

export const INSURANCE_STATUSES = [
  "COMPREHENSIVE",
  "ZERO_DEP",
  "THIRD_PARTY",
  "EXPIRED",
] as const;

export const CAR_STATUSES = [
  "DRAFT",
  "LIVE",
  "RESERVED",
  "SOLD",
  "ARCHIVED",
] as const;

export const POPULAR_BRANDS = [
  "Hyundai",
  "Maruti Suzuki",
  "Tata",
  "Mahindra",
  "Toyota",
  "Honda",
  "Kia",
  "Volkswagen",
  "Skoda",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "MG",
  "Ford",
  "Renault",
  "Nissan",
  "Jeep",
] as const;

export const PRESET_HIGHLIGHT_TAGS = [
  "150+ Checkpoints Certified",
  "Single Owner",
  "Zero Dep Insurance",
  "Complete Service Records",
  "Non-Accidental Guaranteed",
  "Genuine Odometer",
  "New Tyres Fitted",
  "Sunroof Included",
  "Company Maintained",
  "Top Variant",
  "Exchange Available",
  "Immediate Delivery",
] as const;

export const carFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  brand: z.string().min(2, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  variant: z.string().min(1, "Variant is required"),
  bodyType: z.enum(BODY_TYPES),
  manufacturingYear: z.coerce
    .number()
    .int()
    .min(2000, "Year must be 2000 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  registrationYear: z.coerce
    .number()
    .int()
    .min(2000, "Year must be 2000 or later")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  registrationState: z
    .string()
    .min(2, "State code is required (e.g. MP, DL)")
    .max(4)
    .toUpperCase(),
  registrationNumber: z
    .string()
    .min(4, "Registration number is required")
    .max(20)
    .toUpperCase(),
  ownerType: z.enum(OWNER_TYPES),
  kmDriven: z.coerce
    .number()
    .int()
    .min(0, "Kilometers cannot be negative")
    .max(500000, "Value too large"),
  fuelType: z.enum(FUEL_TYPES),
  transmission: z.enum(TRANSMISSION_TYPES),
  colour: z.string().min(2, "Colour is required"),
  insuranceStatus: z.enum(INSURANCE_STATUSES),
  insuranceValidTill: z.string().optional().nullable(),
  price: z.coerce
    .number()
    .int()
    .min(50000, "Price must be at least ₹50,000"),
  discountedPrice: z.coerce
    .number()
    .int()
    .optional()
    .nullable(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  highlightTags: z.array(z.string()).default([]),
  status: z.enum(CAR_STATUSES).default("LIVE"),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  coverImage: z
    .string()
    .url("Valid cover image URL is required")
    .refine((url) => !url.startsWith("blob:"), {
      message: "Temporary browser blob URLs cannot be saved. Please upload photo to Cloudinary.",
    }),
  images: z
    .array(
      z.object({
        url: z
          .string()
          .url("Valid image URL required")
          .refine((url) => !url.startsWith("blob:"), {
            message: "Temporary browser blob URLs cannot be saved. Please upload photo to Cloudinary.",
          }),
        isCover: z.boolean().optional().default(false),
      })
    )
    .min(1, "At least one photo is required"),
}).refine(
  (data) => {
    if (data.discountedPrice && data.discountedPrice >= data.price) {
      return false;
    }
    return true;
  },
  {
    message: "Discounted price must be strictly lower than regular price",
    path: ["discountedPrice"],
  }
).refine(
  (data) => data.registrationYear >= data.manufacturingYear,
  {
    message: "Registration year cannot be earlier than manufacturing year",
    path: ["registrationYear"],
  }
);

export type CarFormData = z.infer<typeof carFormSchema>;
