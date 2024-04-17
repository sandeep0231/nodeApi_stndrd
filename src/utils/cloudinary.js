import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UploadOnCloudinary = async (localpath) => {
  try {
    if (!localpath) return null;
    // now upload file on cloudinary here
    const response = await cloudinary.uploader.upload(localpath, {
      resource_type: "auto",
    });
    // console.log("File uploaded on cloudinary. Response : ", response);
    fs.unlinkSync(localpath); //remove the locally saved file as the upload opration got successful.
    return response;
  } catch (error) {
    fs.unlinkSync(localpath); //remove the locally saved file as the upload opration got failed.
    return null;
  }
};

export { UploadOnCloudinary };
