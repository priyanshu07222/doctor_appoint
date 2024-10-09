import mongoose from "mongoose";

const connectDb = async () => {
    console.log("env file", process.env.MONGO_URI)
    mongoose.connection.on('connected', () => console.log("Databse Connected"))
    await mongoose.connect(`${process.env.MONGO_URI}/prescripto`)
}

export default connectDb