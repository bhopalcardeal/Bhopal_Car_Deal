import { z } from "zod";

// Step 1: Contact Details Schema
export const contactStepSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  whatsappSame: z.boolean().default(true),
  whatsappNumber: z.string().optional(),
  city: z.string().min(2, "Please enter your city (e.g. Bhopal, Indore, Jabalpur)"),
}).refine(
  (data) => {
    if (!data.whatsappSame && data.whatsappNumber) {
      return /^[6-9]\d{9}$/.test(data.whatsappNumber);
    }
    return true;
  },
  {
    message: "Please enter a valid 10-digit WhatsApp number",
    path: ["whatsappNumber"],
  }
);

// Step 2: Registration Details Schema
export const registrationStepSchema = z.object({
  registrationNumber: z
    .string()
    .min(4, "Registration number must be at least 4 characters")
    .max(16, "Registration number is too long")
    .transform((val) => val.toUpperCase().trim()),
  registrationState: z
    .string()
    .min(2, "Please select or enter the 2-letter state code (e.g. MP, DL, HR)")
    .max(3)
    .transform((val) => val.toUpperCase().trim()),
  manufacturingYear: z
    .number({ invalid_type_error: "Please enter a valid manufacturing year" })
    .int()
    .min(2005, "Year must be 2005 or newer")
    .max(new Date().getFullYear(), `Year cannot exceed ${new Date().getFullYear()}`),
  registrationYear: z
    .number({ invalid_type_error: "Please enter a valid registration year" })
    .int()
    .min(2005, "Year must be 2005 or newer")
    .max(new Date().getFullYear(), `Year cannot exceed ${new Date().getFullYear()}`),
  ownerType: z.enum([
    "FIRST",
    "SECOND",
    "THIRD",
    "FOURTH_PLUS",
  ]),
}).refine(
  (data) => data.registrationYear >= data.manufacturingYear,
  {
    message: "Registration year cannot precede manufacturing year",
    path: ["registrationYear"],
  }
);

// Step 3: Vehicle Specs Schema
export const vehicleStepSchema = z.object({
  brand: z.string().min(1, "Please select or specify the brand"),
  modelName: z.string().min(1, "Please enter the vehicle model"),
  variant: z.string().optional().default(""),
  kmDrivenRange: z.string().min(1, "Please select kilometers driven"),
  fuelType: z.enum(["PETROL", "DIESEL", "CNG", "ELECTRIC", "HYBRID"]),
  transmissionType: z.enum(["MANUAL", "AUTOMATIC"]),
});

// Step 4: Pricing & Photos Schema
export const valuationStepSchema = z.object({
  expectedPrice: z
    .number({ invalid_type_error: "Please enter your expected price in ₹" })
    .int()
    .min(50000, "Minimum asking price is ₹50,000")
    .max(100000000, "Maximum asking price is ₹10 Crore"),
  photos: z.array(z.string()).default([]),
  // Honeypot spam defense field (must remain empty for human submissions)
  hp_website: z.string().max(0, "Bot submission detected").optional().default(""),
});

// Full Combined Form Schema
export const fullSellCarFormSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  whatsappSame: z.boolean().default(true),
  whatsappNumber: z.string().optional(),
  city: z.string().min(2, "Please enter your city"),
  registrationNumber: z
    .string()
    .min(4, "Registration number must be at least 4 characters")
    .max(16, "Registration number is too long"),
  registrationState: z
    .string()
    .min(2, "Please select registration state")
    .max(3),
  manufacturingYear: z
    .number()
    .int()
    .min(2005)
    .max(new Date().getFullYear()),
  registrationYear: z
    .number()
    .int()
    .min(2005)
    .max(new Date().getFullYear()),
  ownerType: z.enum([
    "FIRST",
    "SECOND",
    "THIRD",
    "FOURTH_PLUS",
  ]),
  brand: z.string().min(1, "Please specify brand"),
  modelName: z.string().min(1, "Please specify model"),
  variant: z.string().optional().default(""),
  kmDrivenRange: z.string().min(1, "Please specify km range"),
  fuelType: z.enum(["PETROL", "DIESEL", "CNG", "ELECTRIC", "HYBRID"]),
  transmissionType: z.enum(["MANUAL", "AUTOMATIC"]),
  expectedPrice: z.number().int().min(50000).max(100000000),
  photos: z.array(z.string()).default([]),
  hp_website: z.string().max(0).optional().default(""),
});

export type ContactStepData = z.infer<typeof contactStepSchema>;
export type RegistrationStepData = z.infer<typeof registrationStepSchema>;
export type VehicleStepData = z.infer<typeof vehicleStepSchema>;
export type ValuationStepData = z.infer<typeof valuationStepSchema>;
export type SellCarFormData = z.infer<typeof fullSellCarFormSchema>;
