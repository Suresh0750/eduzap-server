"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
const connectToDatabase = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URL);
        logger_1.default.info(`Database connected successfully`);
    }
    catch (error) {
        logger_1.default.error(`Error from connect database :${error}`);
    }
};
exports.default = connectToDatabase;
