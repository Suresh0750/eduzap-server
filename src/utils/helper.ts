import { cloudinary } from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";
import { MulterFile } from "../config/multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../config/s3";
import logger from "./logger";
const bucketName = process.env.AWS_S3_BUCKET;
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


export async function uploadImageS3(file: MulterFile): Promise<string> {
  if (!file?.buffer?.length) {
    throw new Error("No file buffer received");
  }

  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET environment variable is missing");
  }

  // Keep only the extension; never use the original filename as the S3 key.
  const extension = file.originalname.match(/\.[a-zA-Z0-9]{1,10}$/)?.[0] ?? "";
  const key = `${randomUUID()}${extension}`;

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    logger.info(`Image uploaded to S3: ${key}`);

    // Return the object key, not a public URL.
    return key;
  } catch (error) {
    logger.error("S3 image upload failed", error);
    throw error;
  }
}






export async function getImageS3Url(key: string): Promise<string> {
  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET environment variable is missing");
  }

  if (!key || key.startsWith("/") || key.includes("..")) {
    throw new Error("Invalid S3 image key");
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return getSignedUrl(s3, command, {
    expiresIn: 300,
  });
}
