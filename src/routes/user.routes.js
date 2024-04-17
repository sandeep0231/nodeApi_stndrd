import { Router } from "express";
import { LoginUser, RegisterUser } from "../controller/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  RegisterUser,
);

router.route("/login").post(LoginUser);
export default router;
