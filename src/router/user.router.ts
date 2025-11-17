import { Router } from "express";
import { updateUserRequest } from "../controller/userRequest.controller";
import { upload } from "../config/multer";


const userRequest = Router()


userRequest.post("/request",upload.single("image"),updateUserRequest)

export default userRequest;