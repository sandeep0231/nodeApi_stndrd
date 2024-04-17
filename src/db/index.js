import mongoose, { mongo } from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
   const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`);
   console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host} \n`);
  } catch (error) {
    console.log("MongoDb connection Faield.", error);
    process.exit(1); // Exit the node app with an error code of 1 if there's a database connection issue
  }
};

export default connectDB;