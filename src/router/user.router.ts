import { Router } from "express";
import { updateUserRequest } from "../controller/userRequest.controller";
import { upload } from "../config/multer";


const userRouter = Router()


userRouter.post("/request",upload.single("image"),updateUserRequest)

export default userRouter;