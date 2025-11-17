import { IRequest } from "../utils/types";
import UserRequest from "../model/requests.schema";
import logger from "../utils/logger";
import { NextFunction, Request, Response } from 'express';



export const updateUserRequest = async (req:Request,res:Response,next:NextFunction)=>{
    try{

        const { name, phone, title } = req.body 

        if(req.file){
            
        }

        const newRequest: IRequest = {
          name: name?.trim(),
          phone: phone?.trim(),
          title: title?.trim(),
        //   image: uploadedImageUrl,
          timestamp: new Date().toISOString(),
        };
    
        logger.info(`Received new request submission`, newRequest);
    
        const newUser = new UserRequest(newRequest);
        const savedData = await newUser.save();
    
        logger.info(`Data successfully stored`, savedData);
    
        return 

    }catch(err){
        logger.error(`Error from update request ${err}`)
        next(err)
    }
}