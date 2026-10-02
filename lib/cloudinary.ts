import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

/**
 * Configure Cloudinary with server environment variables.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Checks whether Cloudinary credentials are provided in the environment.
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      process.env.CLOUDINARY_CLOUD_NAME !== "your_cloud_name" &&
      process.env.CLOUDINARY_API_KEY !== "your_api_key" &&
      process.env.CLOUDINARY_API_SECRET !== "your_api_secret"
  );
}

export interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
}

/**
 * Uploads a file buffer directly to Cloudinary with automotive folder organization
 * and automatic WebP / auto-quality optimization.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder = process.env.CLOUDINARY_FOLDER || "bhopal-car-deal/inventory",
  filename?: string
): Promise<UploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary credentials missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file."
    );
  }

  return new Promise((resolve, reject) => {
    let finished = false;
    const timeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        reject(new Error("Cloudinary upload timed out after 25 seconds. Please check your network connection."));
      }
    }, 25000);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        public_id: filename
          ? `${Date.now()}-${filename.replace(/\.[^/.]+$/, "").replace(/[^\w-]/g, "_")}`
          : undefined,
        transformation: [
          { quality: "auto:best" },
          { fetch_format: "auto" },
        ],
      },
      (error, result?: UploadApiResponse) => {
        clearTimeout(timeout);
        if (finished) return;
        finished = true;

        if (error || !result) {
          reject(error || new Error("Failed to receive upload response from Cloudinary"));
        } else {
          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

export default cloudinary;
