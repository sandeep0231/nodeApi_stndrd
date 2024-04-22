import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
    subscriber:{
        type:mongoose.Schema.Types.ObjectId, //one who's subscribe
        ref:"User"
    },
    channel:{
        type:mongoose.Schema.Types.ObjectId, //one whom subscriber is 
        ref:"User"
    }


}, { timestamps: true });
export const Subscription = mongoose.model("Subscription", SubscriptionSchema);
