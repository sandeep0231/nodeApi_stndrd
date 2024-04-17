import mongoose from "mongoose";
const HospitalSchema =  new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please provide the hospital's name"],
        unique:true,

    },
    addressLine1:{
        type:String,
        required:[true,"Please provide the addressLine1"],
    },
    addressLine2:{
        type:String,
        required:false,
    },
    City:{
        type:String,
        required:true

    },
    pincode:{
        type:String,
        required:true,
    },
    SpecializedIn:[
        {
            type:String,
        }
    ]

},{timestamps:true});

export const Hospital = mongoose.model("Hospital", HospitalSchema);

// function to create a hospital in the database








