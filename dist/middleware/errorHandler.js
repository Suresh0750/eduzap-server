"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ApiError = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const types_1 = require("../utils/types");
class ApiError extends Error {
    constructor(status, message, code = "INTERNAL_ERROR") {
        super(message);
        this.status = status;
        this.message = message;
        this.code = code;
        this.name = "ApiError";
    }
}
exports.ApiError = ApiError;
const errorHandler = (err, req, res, next) => {
    try {
        logger_1.default.error("[API Error]:", err);
    }
    catch (logErr) {
        console.error("Logger failed:", logErr);
    }
    if (err instanceof ApiError) {
        return res.status(err.status).json({
            error: err.message,
            code: err.code,
        });
    }
    if (err instanceof SyntaxError && "body" in err) {
        return res.status(types_1.HttpStatus.BAD_REQUEST).json({
            error: "Invalid JSON body",
            code: "INVALID_JSON",
        });
    }
    return res.status(types_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
    });
};
exports.errorHandler = errorHandler;
