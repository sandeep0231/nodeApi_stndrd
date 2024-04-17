import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Product"
    },
    quantity: {
        type: Number,
        required: true,
    }
});


const OrderSchema = new mongoose.Schema({
    orderPrice: {
        type: Number,
        required: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USer",
        required: true

    },
    orderItems: {
        type: [OrderItemSchema]

    },
    Address: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["PENDING", "CANCELLED", "DELEVERD"],
        default: "PENDING"
    }

}, { timestamps: true });

export const Order = mongoose.model("Order", OrderSchema);