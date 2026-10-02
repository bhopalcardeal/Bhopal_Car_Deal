import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
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

// GET /api/admin/upload - Returns status of Cloudinary configuration
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    configured: isCloudinaryConfigured(),
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
  });
}

// POST /api/admin/upload - Uploads vehicle images to Cloudinary
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Cloudinary credentials missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.",
      },
      { status: 400 }
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
        { error: "No image files were provided for upload" },
        { status: 400 }
      );
    }

    // Validate all files before beginning uploads
    const ALLOWED_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".heic", ".jfif", ".bmp"];
    for (const file of files) {
      const ext = file.name.includes(".") ? file.name.substring(file.name.lastIndexOf(".")).toLowerCase() : "";
      const isMimeOk = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());
      const isExtOk = ALLOWED_EXTS.includes(ext);

      if (!isMimeOk && !isExtOk) {
        return NextResponse.json(
          {
            error: `Unsupported file type "${file.type || ext}". Allowed formats: JPEG, PNG, WEBP, AVIF, HEIC.`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          {
            error: `File "${file.name}" exceeds the maximum allowed size of 10MB.`,
          },
          { status: 400 }
        );
      }
    }

    const targetFolder =
      (formData.get("folder") as string) ||
      process.env.CLOUDINARY_FOLDER ||
      "bhopal-car-deal/inventory";

    // Upload files to Cloudinary in parallel
    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await uploadToCloudinary(buffer, targetFolder, file.name);

      return {
        url: result.secureUrl,
        publicId: result.publicId,
        originalName: file.name,
        width: result.width,
        height: result.height,
      };
    });

    const results = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      count: results.length,
      uploaded: results,
    });
  } catch (error) {
    console.error("[Cloudinary Upload Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to upload image(s) to Cloudinary";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
