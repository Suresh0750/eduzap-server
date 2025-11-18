import { cloudinary } from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";
import { MulterFile } from "../config/multer";
import logger from "./logger";

export async function uploadImage(file: MulterFile): Promise<string> {
  try {
    if (!file || !file.buffer) {
      throw new Error("No file buffer received");
    }

    const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "requests" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!);
        }
      );

      stream.end(file.buffer);
    });

    return uploadResult.secure_url; 
  } catch (err) {
    logger.error("Cloudinary Upload Error:", err);
    throw err;
  }
}

export async function uploadImageFromBase64(base64String: string): Promise<string> {
  try {
    if (!base64String) {
      throw new Error("No base64 string received");
    }

    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    let base64Data = base64String;
    if (base64String.includes(',')) {
      base64Data = base64String.split(',')[1];
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "requests" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!);
        }
      );

      stream.end(buffer);
    });

    return uploadResult.secure_url; 
  } catch (err) {
    logger.error("Cloudinary Upload Error from base64:", err);
    throw err;
  }
}
