import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.Model.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";

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
  const { AccessToken, RefreshToken } = await generateAccessAndRefreshToken(CheckUser?._id);

  const loggedInUser = await User.findById(CheckUser?._id).select(
    "-password -refreshToken",
  );
  // send cookie and response to the user/client
  const options = {
    httpOnly:true,
    secure:true
  }
  return res
    .status(200)
    .cookie("AccessToken", AccessToken, options)
    .cookie("RefreshToken", RefreshToken, options)
    .json(new ApiResponse(200,{user:loggedInUser,AccessToken,RefreshToken},"User LoggedIn Successfully."));
});

export { RegisterUser, LoginUser };
