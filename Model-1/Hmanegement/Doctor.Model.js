import mongoose from "mongoose";
const DoctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    salary: {
        type: Number,
        required: true,
        default: 10000
    },
    qalification: {
        type: String,
        required: true,
    },
    experience: {
        type: String,
        required: false,
        default: 0
    },
    speciality: {
        type: String,
        required: true,
    },
    WorkInHospitals: [  //use array to store multiple hospitals   for the doctor to work in
        {
            type: mongoose.Schema.Types.ObjectId,  // reference to the Hospitals collection
            ref: 'Hospital'
        },
    ],


}, { timestamps: true });

export const Doctor = mongoose.model("Doctor", DoctorSchema);