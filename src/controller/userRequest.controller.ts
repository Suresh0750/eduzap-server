import { IRequest } from "../utils/types";
import UserRequest from "../model/requests.schema";
import logger from "../utils/logger";
import { NextFunction, Request, Response } from 'express';
import { uploadImage } from "../utils/helper";
import { HttpStatus } from "../utils/types";



export const updateUserRequest = async (req:Request,res:Response,next:NextFunction)=>{
    try{

        const { name, phone, title, image } = req.body 

        try{
            logger.info(`payload data's ${JSON.stringify(req.body)} file : ${req.file}`)
        }catch(err){
            logger.error(`log the error of the file ${err}`)
        }

        let imageUrl = undefined;

        if (req.file) {
            logger.info(`Log the file :${JSON.stringify(req.file)}`)
            imageUrl = await uploadImage(req.file);
            logger.info(`Image has been uploaded to cloudinary from multer & URL : ${imageUrl}`)
        }

        const newRequest: IRequest = {
            name: name?.trim(),
            phone: phone?.trim(),
            title: title?.trim(),
            ...(imageUrl ? { image: imageUrl } : {}),
            timestamp: new Date().toISOString(),
          };
           
    
        logger.info(`Received new request submission`, newRequest);
    
        const newUser = new UserRequest(newRequest);
        const savedData = await newUser.save();
    
        logger.info(`Data successfully stored`, savedData);
    
        return res.status(HttpStatus.CREATED).send({success :true, data: savedData})

    }catch(err){
        logger.error(`Error from update request ${err}`)
        next(err)
    }
}


export const getUserRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const searchTerm =
        typeof req.query.search === "string" && req.query.search.trim().length
          ? req.query.search.trim()
          : undefined;
      const sortOrder =
        typeof req.query.sortOrder === "string" &&
        req.query.sortOrder.toLowerCase() === "asc"
          ? "asc"
          : "desc";

      const page = Math.max(
        Number.parseInt((req.query.page as string) ?? "1", 10) || 1,
        1
      );
      const limit = Math.max(
        Number.parseInt((req.query.limit as string) ?? "10", 10) || 10,
        1
      );

      const filter: Record<string, unknown> = {};

      if (searchTerm) {
        const regex = new RegExp(searchTerm, "i");
        filter.$or = [{ name: regex }, { phone: regex }, { title: regex }];
      }

      const sortDirection = sortOrder === "asc" ? 1 : -1;

      const [totalCount, requests] = await Promise.all([
        UserRequest.countDocuments(filter),
        UserRequest.find(filter)
          .sort({ timestamp: sortDirection })
          .skip((page - 1) * limit)
          .limit(limit),
      ]);

      return res.status(HttpStatus.OK).send({
        success: true,
        data: requests,
        meta: {
          totalCount,
          page,
          limit,
          hasMore: page * limit < totalCount,
        },
      });
    } catch (err) {
      logger.error(`Error from get request ${err}`);
      next(err);
    }
  };


export const deleteUserRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { requestId } = req.params;
  
      if (!requestId) {
        logger.warn(`Delete request attempted without requestId`);
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ success: false, message: "requestId is required" });
      }
  
      const deletedRequest = await UserRequest.findByIdAndDelete(requestId);
  
      if (!deletedRequest) {
        logger.warn(`Request not found for deletion: ${requestId}`);
        return res
          .status(HttpStatus.NOT_FOUND)
          .send({ success: false, message: "Request not found" });
      }
  
      logger.info(`Request deleted successfully`, deletedRequest);
      return res
        .status(HttpStatus.OK)
        .send({ success: true, data: deletedRequest });
    } catch (err) {
      logger.error(`Error from delete request ${err}`);
      next(err);
    }
  };
