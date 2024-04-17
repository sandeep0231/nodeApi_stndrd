import mongoose from "mongoose";
const PatinetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    diagnosewith: {
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    age:{
        type: Number, 
        required: false,
    },
    bloodGroup:{
        type:String,
        required:true,
    },
    gender:{
        type:String,
        required:true,
        enum:['M','F','O'],
    },
    admittedIn:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Hospital",

    },


}, { timestamps: true });

export const Patinet = mongoose.model("Patient", PatinetSchema);