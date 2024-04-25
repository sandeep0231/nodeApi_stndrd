import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoose, { Schema } from "mongoose";

const LikeSchema = new Schema(
  {
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet",
    },
  },
  { timestamps: true },
);

LikeSchema.plugin(mongooseAggregatePaginate);
export const Like = mongoose.model("Like", LikeSchema);
