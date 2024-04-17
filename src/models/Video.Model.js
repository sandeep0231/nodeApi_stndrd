import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const VideoSchema = new mongoose.Schema(
  {
    videofile: {
      type: String, //url from cloudinary
      required: true,
    },
    thumbnail: {
      type: String, //url from cloudinary
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, //in seconds
      default: 0,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

VideoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model("Video", VideoSchema);

// Adds a video to the database
