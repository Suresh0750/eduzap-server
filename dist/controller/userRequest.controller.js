"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserRequest = exports.getUserRequest = exports.updateUserRequest = void 0;
const requests_schema_1 = __importDefault(require("../model/requests.schema"));
const logger_1 = __importDefault(require("../utils/logger"));
const helper_1 = require("../utils/helper");
const types_1 = require("../utils/types");
const validate_1 = require("../utils/validate");
const errorHandler_1 = require("../middleware/errorHandler");
const updateUserRequest = async (req, res, next) => {
    try {
        const { name, phone, title, image } = req.body;
        const validationResult = validate_1.userRequestSchema.safeParse({
            name,
            phone,
            title,
        });
        if (!validationResult.success) {
            const errorMessages = validationResult.error.issues
                .map((err) => `${err.path.join('.')}: ${err.message}`)
                .join(', ');
            logger_1.default.warn(`Validation failed for updateUserRequest: ${errorMessages}`);
            throw new errorHandler_1.ApiError(types_1.HttpStatus.BAD_REQUEST, `Validation error: ${errorMessages}`, "VALIDATION_ERROR");
        }
        const validatedData = validationResult.data;
        try {
            logger_1.default.info(`payload data's ${JSON.stringify(req.body)} file : ${req.file}`);
        }
        catch (err) {
            logger_1.default.error(`log the error of the file ${err}`);
        }
        let imageUrl = undefined;
        if (req.file) {
            logger_1.default.info(`Log the file :${JSON.stringify(req.file)}`);
            imageUrl = await (0, helper_1.uploadImage)(req.file);
            logger_1.default.info(`Image has been uploaded to cloudinary from multer & URL : ${imageUrl}`);
        }
        const newRequest = {
            name: validatedData.name,
            phone: validatedData.phone,
            title: validatedData.title,
            ...(imageUrl ? { image: imageUrl } : {}),
            timestamp: new Date().toISOString(),
        };
        logger_1.default.info(`Received new request submission`, newRequest);
        const newUser = new requests_schema_1.default(newRequest);
        const savedData = await newUser.save();
        logger_1.default.info(`Data successfully stored`, savedData);
        return res.status(types_1.HttpStatus.CREATED).send({ success: true, data: savedData });
    }
    catch (err) {
        logger_1.default.error(`Error from update request ${err}`);
        next(err);
    }
};
exports.updateUserRequest = updateUserRequest;
const getUserRequest = async (req, res, next) => {
    try {
        const searchTerm = typeof req.query.search === "string" && req.query.search.trim().length
            ? req.query.search.trim()
            : undefined;
        const sortOrder = typeof req.query.sortOrder === "string" &&
            req.query.sortOrder.toLowerCase() === "asc"
            ? "asc"
            : "desc";
        const page = Math.max(Number.parseInt(req.query.page ?? "1", 10) || 1, 1);
        const limit = Math.max(Number.parseInt(req.query.limit ?? "10", 10) || 10, 1);
        const filter = {};
        if (searchTerm) {
            const regex = new RegExp(searchTerm, "i");
            filter.$or = [{ name: regex }, { phone: regex }, { title: regex }];
        }
        const sortDirection = sortOrder === "asc" ? 1 : -1;
        const [totalCount, requests] = await Promise.all([
            requests_schema_1.default.countDocuments(filter),
            requests_schema_1.default.find(filter)
                .sort({ timestamp: sortDirection })
                .skip((page - 1) * limit)
                .limit(limit),
        ]);
        return res.status(types_1.HttpStatus.OK).send({
            success: true,
            data: requests,
            meta: {
                totalCount,
                page,
                limit,
                hasMore: page * limit < totalCount,
            },
        });
    }
    catch (err) {
        logger_1.default.error(`Error from get request ${err}`);
        next(err);
    }
};
exports.getUserRequest = getUserRequest;
const deleteUserRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        if (!requestId) {
            logger_1.default.warn(`Delete request attempted without requestId`);
            return res
                .status(types_1.HttpStatus.BAD_REQUEST)
                .send({ success: false, message: "requestId is required" });
        }
        const deletedRequest = await requests_schema_1.default.findByIdAndDelete(requestId);
        if (!deletedRequest) {
            logger_1.default.warn(`Request not found for deletion: ${requestId}`);
            return res
                .status(types_1.HttpStatus.NOT_FOUND)
                .send({ success: false, message: "Request not found" });
        }
        logger_1.default.info(`Request deleted successfully`, deletedRequest);
        return res
            .status(types_1.HttpStatus.OK)
            .send({ success: true, data: deletedRequest });
    }
    catch (err) {
        logger_1.default.error(`Error from delete request ${err}`);
        next(err);
    }
};
exports.deleteUserRequest = deleteUserRequest;
