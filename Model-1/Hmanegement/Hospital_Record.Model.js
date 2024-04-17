import mongoose, { mongo }  from "mongoose";
const Hospital_RecordSchema = new mongoose.Schema({
    
},{timestamps:true});

export const Hospital_Record = mongoose.model("Hospital_Record", Hospital_RecordSchema);