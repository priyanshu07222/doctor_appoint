import { Request, Response } from "express";
import validator from 'validator'
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel";
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel";
import userModel from "../models/userModel";


// API for adding doctor




const addDoctor = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file

        // console.log(name, email, password, speciality, degree, experience, about, fees, JSON.parse(address))

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

// API to get all appointments list

const appointmentsAdmin = async (req: Request, res: Response) => {
    try {
        const appointments = await appointmentModel.find({})
        res.json({
            success: true,
            appointments
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error })
    }
}


// API for appointment cancellation
const appointmentCancel = async (req: Request, res: Response): Promise<any> => {
    try {
        const { appointmentId } = req.body
        // console.log("ne wid", appointmentId)

        const appointmentData = await appointmentModel.findById(appointmentId)



        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // releasing doctor slot

        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked
        slots_booked[slotDate] = slots_booked[slotDate].filter((e: Date) => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({
            success: true,
            message: "Appointment Cancelled"
        })

    } catch (error: any) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}


// API to get dashboard data for admin Panel

const adminDashboard = async (req: Request, res: Response) => {
    try {
        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }

        res.json({
            success: true,
            dashData
        })
    } catch (error: any) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

export { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard }

