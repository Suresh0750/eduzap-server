"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = uploadImage;
const cloudinary_1 = require("../config/cloudinary");
const logger_1 = __importDefault(require("./logger"));
async function uploadImage(file) {
    try {
        if (!file || !file.buffer) {
            throw new Error("No file buffer received");
        }
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary_1.cloudinary.uploader.upload_stream({ folder: "requests" }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
            stream.end(file.buffer);
        });
        return uploadResult.secure_url;
    }
    catch (err) {
        logger_1.default.error("Cloudinary Upload Error:", err);
        throw err;
    }
}
