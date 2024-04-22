import { Router } from "express";
import { LoginUser, LogoutUser, RegisterUser, RefreshAccessToken, ChangeCurrentPassword, getCurrentUser, updateAccountDetails } from "../controller/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
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
router.route("/logout").post(verifyJWT, LogoutUser);
router.route("/refresh_token").post(RefreshAccessToken);
router.route("/changeCurrent_password").post(verifyJWT, ChangeCurrentPassword);
router.route("/getCurrent_user").get(verifyJWT, getCurrentUser);
router.route("/user_accountInfoUpdate").patch(verifyJWT,updateAccountDetails);
export default router;
