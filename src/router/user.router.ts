import { Router } from "express";
import { getUserRequest, updateUserRequest } from "../controller/userRequest.controller";
import { upload } from "../config/multer";


const userRouter = Router()


userRouter
  .route("/")
  .post(upload.single("image"), updateUserRequest)
  .get(getUserRequest);


export default userRouter;