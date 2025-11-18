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
