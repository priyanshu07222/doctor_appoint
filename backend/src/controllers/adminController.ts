import { Request, Response } from "express";
import validator from 'validator'
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel";
import jwt from 'jsonwebtoken'


// API for adding doctor




const addDoctor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file

        console.log(name, email, password, speciality, degree, experience, about, fees, address)

        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address || !imageFile) {
            res.status(400).json({
                success: false,
                message: "Missing Details"
            })
        }

        if (!imageFile) {
            throw new Error('Something went wrong')
        }

        // validating email format
        if (!validator.isEmail(email)) {
            res.status(400).json({
                success: false,
                message: "MPlease enter a valid email"
            })
        }

        // validating strong password
        if (password.length < 8) {
            res.status(400).json({
                success: false,
                message: "Please enter a strong password"
            })
        }

        // hashing doctor password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile?.path, { resource_type: 'image' })
        const imageUrl = imageUpload.secure_url

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()

        res.status(201).json({
            success: true,
            message: "Doctor added"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error
        })
    }
}

// API for admin Login

const loginAdmin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET!)
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
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error })
    }
}

// API to get all doctors list for admin panel

const allDoctors = async (req: Request, res: Response) => {
    try {
        const doctors = await doctorModel.find({}).select('-password')
        res.json({
            success: true,
            doctors
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error })
    }
}

export { addDoctor, loginAdmin, allDoctors }

