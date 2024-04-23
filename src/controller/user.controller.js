import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.Model.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
// Internal services  methods start here
const generateAccessAndRefreshToken = async (UserId) => {
  try {
    const user = await User.findById(UserId);
    const AccessToken = user.generateAccessToken();
    const RefreshToken = user.generateRefreshToken();
    // console.log("gettoken",AccessToken);
    // console.log("getRefreshToken",RefreshToken);
    user.refreshToken = RefreshToken;
    await user.save({ validateBeforeSave: false });
    return { AccessToken, RefreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Internal server error.");
  }
};
//  Internal services  methods end here

const RegisterUser = asyncHandler(async (req, res) => {
  //  get user detail from front end
  const { username, fullName, email, password } = req?.body;
  // validation for user detail
  if (
    [username, fullName, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Username is required.");
  }
  // check if user already exist:username,email
  const UserExistance = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (UserExistance) {
    throw new ApiError(409, "Username or email already exist.");
  }

  // check for file : images,check for avatar
  const avatarLocalPath = req?.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (
    req?.files &&
    Array.isArray(req.files.coverImage && req.files.coverImage.lenght > 0)
  ) {
    coverImageLocalPath = req?.files?.coverImage[0]?.path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required...");
  }
  // upload file to cloudinary,get url
  const avatar = await UploadOnCloudinary(avatarLocalPath);
  const coverImage = await UploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar is required.");
  }

  // create user object
  // save user detail to database
  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar?.url,
    coverImage: coverImage?.url || "",
  });
  // console.log(user);
  // remove password and refresh token field from response
  const createdUser = await User.findById(user?._id).select(
    "-password -refreshToken",
  );
  // console.log(createdUser);
  // check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating a user.");
  }
  // send response to front end
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created successfully."));
});

const LoginUser = asyncHandler(async (req, res) => {
  // get user data from request body
  const { username, email, password } = req?.body;
  // check validation for login inputs which is comes from client side
  if (!username.trim() && !email.trim()) {
    throw new ApiError(400, "Username or Email is required.");
  }
  if (!password.trim()) {
    throw new ApiError(400, "Password is required.");
  }
  // FIND USER INTO A DB (EXISTANCE) via username or  email
  const CheckUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!CheckUser) {
    throw new ApiError(404, "User does not exist.");
  }
  // check valid password or not
  const isPasswordValid = await CheckUser.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Password.");
  }
  // store a Refresh token into a db
  // get access token and refresh token for user
  const { AccessToken, RefreshToken } = await generateAccessAndRefreshToken(
    CheckUser?._id,
  );

  const loggedInUser = await User.findById(CheckUser?._id).select(
    "-password -refreshToken",
  );
  // send cookie and response to the user/client
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("AccessToken", AccessToken, options)
    .cookie("RefreshToken", RefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, AccessToken, RefreshToken },
        "User LoggedIn Successfully.",
      ),
    );
});

const LogoutUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true },
  );

  // remove cookies here
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("AccessToken", options)
    .clearCookie("RefreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out!"));
});

const RefreshAccessToken = asyncHandler(async (req, res) => {
  const IncomeingRefreshTKN =
    req.cookies?.RefreshToken || req?.body?.RefreshToken;
  if (!IncomeingRefreshTKN) {
    throw new ApiError(401, "Unauthorized request. ");
  }
  try {
    const decodeTKN = jwt.verify(
      IncomeingRefreshTKN,
      process.env.REFRESH_TOKEN_SECRET,
    );
    //  console.log(decodeTKN);
    if (!decodeTKN) {
      throw new ApiError(401, "Unauthorized request. ");
    }
    const user = await User.findById(decodeTKN?.id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token.");
    }
    // console.log(user);
    if (IncomeingRefreshTKN !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token invalid or exipired.");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { AccessToken, RefreshToken } = await generateAccessAndRefreshToken(
      user?._id,
    );
    return res
      .status(200)
      .cookie("AccessToken", AccessToken, options)
      .cookie("RefreshToken", RefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { AccessToken, RefreshToken },
          "Access Token Refreshed.",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh  token.");
  }
});

const ChangeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req?.body;
  console.log(oldPassword, newPassword);
  console.log(req?.user?.id);

  const user = await User.findById(req?.user?.id);
  const isPAsswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPAsswordCorrect) {
    throw new ApiError(400, "Invalid Old password.");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200, {}, "Password Changed."));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req?.user, "Current user fetch successfully."));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req?.body;
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required.");
  }
  const user = await User.findByIdAndUpdate(
    req?.user?.id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true },
  ).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details updated successfully."));
});

const UpdateUserAvatar = asyncHandler(async (req, res) => {
  const AvatarLocalPath = req?.file?.path;
  console.log(AvatarLocalPath);
  if (!AvatarLocalPath) {
    throw new ApiError(400, "User Avatar is required.");
  }
  const avatarCloudUrl = await UploadOnCloudinary(AvatarLocalPath);
  if (!avatarCloudUrl?.url) {
    throw new ApiError(400, "Error while uploading a Avatar.");
  }

  const userData = await User.findByIdAndUpdate(
    req?.user?.id,
    {
      $set: {
        avatar: avatarCloudUrl?.url,
      },
    },
    { new: true },
  ).select("-password -refreshToken");
  // send response to client
  return res
    .status(200)
    .json(new ApiResponse(200, userData, "User avatar uloaded successfully."));
});

const UpdateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req?.file?.path;
  // console.log(coverImageLocalPath);
  if (!coverImageLocalPath) {
    throw new ApiError(400, "User coverimage is required.");
  }
  const CoverImgCloud = await UploadOnCloudinary(coverImageLocalPath);
  if (!CoverImgCloud) {
    throw new ApiError(400, "Error while uploading a cover image.");
  }

  // update cover img url on db
  const userData = await User.findByIdAndUpdate(
    req?.user?.id,
    {
      $set: {
        coverImage: CoverImgCloud?.url,
      },
    },
    { new: true },
  ).select("-password -refreshToken");
  // send response to client
  return res
    .status(200)
    .json(
      new ApiResponse(200, userData, "User cover image uploaded successfully."),
    );
});

const GetUserChannelProfile = asyncHandler(async (req, res) => {
  const {username} = req?.params;
  if(!username?.trim()){
    throw new ApiError(400,"Username is missing.");

  }
});
export {
  RegisterUser,
  LoginUser,
  LogoutUser,
  RefreshAccessToken,
  ChangeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  UpdateUserAvatar,
  UpdateUserCoverImage,
  GetUserChannelProfile,
};
