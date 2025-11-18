import { Router } from "express";
import { deleteUserRequest, getUserRequest, updateUserRequest } from "../controller/userRequest.controller";
import { upload } from "../config/multer";


const userRouter = Router()


userRouter
  .route("/")
  .post(upload.single("image"), updateUserRequest)
  .get(getUserRequest);

userRouter.delete("/:requestId",deleteUserRequest)


export default userRouter;