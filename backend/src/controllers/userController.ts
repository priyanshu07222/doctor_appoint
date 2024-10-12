import validator from "validator";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from "cloudinary";

// API to register user

import { Request, Response } from "express";
import userModel from "../models/userModel";

const registerUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, email, password } = req.body

        if (!name || !password || !email) {
            return res.json({
                success: false,
                message: "Missing Details"
            })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({
                success: false,
                message: "enter a valid email"
            })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({
                success: false,
                message: "enter a strong password"
            })
        }

        // hashed user passsword

        const hashedPassword = await bcrypt.hash(password, 10)

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!)

        res.json({
            success: true,
            token
        })
    } catch (error: any) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }

}

// API for user login
const loginUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, passsword } = req.body
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({
                success: false,
                message: "user does not exist"
            })
        }

        const isMatch = await bcrypt.compare(passsword, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!)
            res.json({
                success: true,
                token
            })
        } else {
            res.json({
                success: false,
                message: "Invalid credentials"
            })
        }
    } catch (error: any) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

const getProfile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({
            success: true,
            userData
        })
    } catch (error: any) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

// API to update user Profile

const updateProfile = async (req: Request, res: Response) => {
    try {
        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!userId || !name || !phone || !address || !dob || !gender) {
            return res.json({
                success: false,
                message: "Data Missing"
            })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {
            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, {
                image: imageURL
            })
        }

        res.json({
            success: true,
            message: "Profile updated"
        })
    } catch (error: any) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}
export { registerUser, loginUser, getProfile, updateProfile }