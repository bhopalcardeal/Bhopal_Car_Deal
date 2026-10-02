import { NextRequest, NextResponse } from "next/server";
import { isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per image
const MAX_PHOTOS_PER_LEAD = 6;

// POST /api/leads/upload - Public endpoint for sellers uploading car photos in Sell Your Car flow
export async function POST(req: NextRequest) {
  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Image upload storage is not configured. Please ensure Cloudinary credentials are set in .env.",
      },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    let files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      const single = formData.get("file") as File | null;
      if (single) files = [single];
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No image files were provided" },
        { status: 400 }
      );
    }

    if (files.length > MAX_PHOTOS_PER_LEAD) {
      return NextResponse.json(
        { error: `You can upload a maximum of ${MAX_PHOTOS_PER_LEAD} photos` },
        { status: 400 }
      );
    }

    // Validate MIME types and file sizes
    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
        return NextResponse.json(
          {
            error: `Unsupported file format for "${file.name}". Please upload JPEG, PNG, or WebP photos.`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          {
            error: `Photo "${file.name}" exceeds the 10MB limit.`,
          },
          { status: 400 }
        );
      }
    }

    const baseFolder = process.env.CLOUDINARY_FOLDER || "bhopal_car_deal";
    const targetFolder = `${baseFolder}/leads`;

    // Upload to Cloudinary in parallel
    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await uploadToCloudinary(buffer, targetFolder, file.name);

      return {
        url: result.secureUrl,
        publicId: result.publicId,
        originalName: file.name,
      };
    });

    const uploaded = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      count: uploaded.length,
      uploaded,
    });
  } catch (error) {
    console.error("[Leads Cloudinary Upload Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to upload photo to Cloudinary";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
