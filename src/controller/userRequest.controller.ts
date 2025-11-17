import { IRequest } from "../utils/types";
import UserRequest from "../model/requests.schema";
import logger from "../utils/logger";
import { NextFunction, Request, Response } from 'express';
import { uploadImage } from "../utils/helper";
import { HttpStatus } from "../utils/types";



export const updateUserRequest = async (req:Request,res:Response,next:NextFunction)=>{
    try{

        const { name, phone, title } = req.body 

        let imageUrl = undefined;

        if (req.file) {
            imageUrl = await uploadImage(req.file);
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