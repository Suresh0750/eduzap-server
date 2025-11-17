import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { HttpStatus } from "../utils/types";


export class ApiError extends Error {
    constructor(
      public status: number,
      public message: string,
      public code: string = "INTERNAL_ERROR"
    ) {
      super(message);
      this.name = "ApiError";
    }
  }
  

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.error("[API Error]:", err);
  } catch (logErr) {
    console.error("Logger failed:", logErr);
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: err.message,
      code: err.code,
    });
  }


  if (err instanceof SyntaxError && "body" in err) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      error: "Invalid JSON body",
      code: "INVALID_JSON",
    });
  }


  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    error: "Internal server error",
    code: "INTERNAL_ERROR",
  });
};
