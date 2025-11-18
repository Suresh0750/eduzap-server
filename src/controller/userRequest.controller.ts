import { IRequest } from "../utils/types";
import UserRequest from "../model/requests.schema";
import logger from "../utils/logger";
import { NextFunction, Request, Response } from 'express';
import { uploadImage, uploadImageFromBase64 } from "../utils/helper";
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


export const getUserRequest = async (req:Request,res:Response,next:NextFunction)=>{
    try {

        const allRequest = await UserRequest.find({})
        return res.status(HttpStatus.OK).send({success:true,data : allRequest})
        
    } catch (err) {
         logger.error(`Error from update request ${err}`)
        next(err)
    }
}