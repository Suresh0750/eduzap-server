"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRequest_controller_1 = require("../controller/userRequest.controller");
const multer_1 = require("../config/multer");
const userRouter = (0, express_1.Router)();
userRouter
    .route("/")
    .post(multer_1.upload.single("image"), userRequest_controller_1.updateUserRequest)
    .get(userRequest_controller_1.getUserRequest);
userRouter.delete("/:requestId", userRequest_controller_1.deleteUserRequest);
exports.default = userRouter;
