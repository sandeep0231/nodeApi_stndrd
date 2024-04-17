import mongoose from "mongoose";
const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,

    },
    description: {
        type: String,
        required: true
    },
    ProductImage: {
        type: String,
        required: true
    },
    price:{
        type:Number,
        required:true,
        default:0
    },
    stock:{
        type:Number,
        required:false,
        default:0
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,  //reference for product schema to categorias
        ref:"Category",
        required:true,
    },
    Owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },

}, { timestamps: true });
export const Product = mongoose.model("Product", ProductSchema);
// 商品名称