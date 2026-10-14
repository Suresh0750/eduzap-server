"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRequestSchema = void 0;
const zod_1 = require("zod");
exports.userRequestSchema = zod_1.z.object({
    name: zod_1.z
        .string({ message: "Name is required" })
        .trim()
        .min(1, "Name cannot be empty"),
    phone: zod_1.z
        .string({ message: "Phone is required" })
        .regex(/^[0-9]{10}$/, "Phone number must be a 10-digit number"),
    title: zod_1.z
        .string({ message: "Title is required" })
        .trim()
        .min(1, "Title cannot be empty"),
    image: zod_1.z.string().url("Invalid image URL").optional().nullable(),
    timestamp: zod_1.z
        .union([zod_1.z.date(), zod_1.z.string().datetime()])
        .optional()
        .default(() => new Date()),
});
