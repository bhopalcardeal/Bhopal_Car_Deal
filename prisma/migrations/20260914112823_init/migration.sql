-- CreateEnum
CREATE TYPE "CarBodyType" AS ENUM ('HATCHBACK', 'SEDAN', 'SUV', 'COUPE', 'CONVERTIBLE', 'MUV', 'LUXURY');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID');

-- CreateEnum
CREATE TYPE "TransmissionType" AS ENUM ('MANUAL', 'AUTOMATIC', 'IMT');

-- CreateEnum
CREATE TYPE "OwnerType" AS ENUM ('FIRST', 'SECOND', 'THIRD', 'FOURTH_PLUS');

-- CreateEnum
CREATE TYPE "InsuranceStatus" AS ENUM ('COMPREHENSIVE', 'ZERO_DEP', 'THIRD_PARTY', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CarStatus" AS ENUM ('DRAFT', 'LIVE', 'RESERVED', 'SOLD', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'INSPECTION_SCHEDULED', 'EVALUATED_OFFER_MADE', 'PURCHASED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EnquirySource" AS ENUM ('CAR_DETAIL', 'HOME_PAGE', 'CONTACT_PAGE', 'DIRECT_CALL');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'TEST_DRIVE_SCHEDULED', 'NEGOTIATION', 'WON_SOLD', 'LOST');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'STAFF');

-- CreateTable
CREATE TABLE "car_listings" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "bodyType" "CarBodyType" NOT NULL,
    "manufacturingYear" INTEGER NOT NULL,
    "registrationYear" INTEGER NOT NULL,
    "registrationState" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "ownerType" "OwnerType" NOT NULL,
    "kmDriven" INTEGER NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "transmission" "TransmissionType" NOT NULL,
    "colour" TEXT NOT NULL,
    "insuranceStatus" "InsuranceStatus" NOT NULL,
    "insuranceValidTill" TIMESTAMP(3),
    "price" INTEGER NOT NULL,
    "discountedPrice" INTEGER,
    "discountPercent" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "description" TEXT NOT NULL,
    "highlightTags" TEXT[],
    "status" "CarStatus" NOT NULL DEFAULT 'LIVE',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isNewArrival" BOOLEAN NOT NULL DEFAULT false,
    "coverImage" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "car_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "car_images" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "car_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "whatsappNumber" TEXT,
    "city" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "registrationState" TEXT NOT NULL,
    "manufacturingYear" INTEGER NOT NULL,
    "registrationYear" INTEGER NOT NULL,
    "ownerType" "OwnerType" NOT NULL,
    "brand" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "variant" TEXT,
    "kmDrivenRange" TEXT NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "transmissionType" "TransmissionType" NOT NULL,
    "expectedPrice" INTEGER NOT NULL,
    "photos" TEXT[],
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "internalNotes" TEXT,
    "assignedToId" TEXT,
    "convertedCarId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buyer_enquiries" (
    "id" TEXT NOT NULL,
    "relatedCarId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "message" TEXT,
    "source" "EnquirySource" NOT NULL DEFAULT 'CAR_DETAIL',
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buyer_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "image" TEXT NOT NULL,
    "link" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "photo" TEXT,
    "quote" TEXT NOT NULL,
    "carBought" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "featured" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "static_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "static_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "car_listings_slug_key" ON "car_listings"("slug");

-- CreateIndex
CREATE INDEX "car_listings_status_idx" ON "car_listings"("status");

-- CreateIndex
CREATE INDEX "car_listings_brand_idx" ON "car_listings"("brand");

-- CreateIndex
CREATE INDEX "car_listings_price_idx" ON "car_listings"("price");

-- CreateIndex
CREATE INDEX "car_listings_createdAt_idx" ON "car_listings"("createdAt");

-- CreateIndex
CREATE INDEX "car_listings_isFeatured_idx" ON "car_listings"("isFeatured");

-- CreateIndex
CREATE INDEX "car_listings_isNewArrival_idx" ON "car_listings"("isNewArrival");

-- CreateIndex
CREATE INDEX "car_listings_bodyType_idx" ON "car_listings"("bodyType");

-- CreateIndex
CREATE INDEX "car_listings_fuelType_idx" ON "car_listings"("fuelType");

-- CreateIndex
CREATE INDEX "car_listings_status_brand_price_idx" ON "car_listings"("status", "brand", "price");

-- CreateIndex
CREATE INDEX "car_images_carId_order_idx" ON "car_images"("carId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "seller_leads_convertedCarId_key" ON "seller_leads"("convertedCarId");

-- CreateIndex
CREATE INDEX "seller_leads_status_idx" ON "seller_leads"("status");

-- CreateIndex
CREATE INDEX "seller_leads_createdAt_idx" ON "seller_leads"("createdAt");

-- CreateIndex
CREATE INDEX "seller_leads_brand_idx" ON "seller_leads"("brand");

-- CreateIndex
CREATE INDEX "buyer_enquiries_relatedCarId_idx" ON "buyer_enquiries"("relatedCarId");

-- CreateIndex
CREATE INDEX "buyer_enquiries_status_idx" ON "buyer_enquiries"("status");

-- CreateIndex
CREATE INDEX "buyer_enquiries_createdAt_idx" ON "buyer_enquiries"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "banners_active_order_idx" ON "banners"("active", "order");

-- CreateIndex
CREATE INDEX "testimonials_featured_idx" ON "testimonials"("featured");

-- CreateIndex
CREATE INDEX "faqs_active_order_idx" ON "faqs"("active", "order");

-- CreateIndex
CREATE UNIQUE INDEX "static_pages_slug_key" ON "static_pages"("slug");

-- AddForeignKey
ALTER TABLE "car_listings" ADD CONSTRAINT "car_listings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_images" ADD CONSTRAINT "car_images_carId_fkey" FOREIGN KEY ("carId") REFERENCES "car_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_leads" ADD CONSTRAINT "seller_leads_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_enquiries" ADD CONSTRAINT "buyer_enquiries_relatedCarId_fkey" FOREIGN KEY ("relatedCarId") REFERENCES "car_listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
