import validator from "validator";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from "cloudinary";
import razorpay from 'razorpay'

// API to register user

import { Request, Response } from "express";
import userModel from "../models/userModel";
import doctorModel from "../models/doctorModel";
import appointmentModel from "../models/appointmentModel";
import Razorpay from "razorpay";
import { Orders } from "razorpay/dist/types/orders";


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

const updateProfile = async (req: Request, res: Response): Promise<any> => {
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

// API to book appointment

const bookAppointment = async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body

        const docData = await doctorModel.findById(docId).select('-password')

        if (!docData.available) {
            return res.json({
                success: false,
                message: 'Doctor not available'
            })
        }

        let slots_booked = docData.slots_booked

        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({
                    success: false,
                    message: 'Slot not available'
                })
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password')

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()


        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({
            success: true,
            message: "Appointment booked"
        })


    } catch (error: any) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}


// API to get user appointment for frontend my-appointments page

const listAppointment = async (req: Request, res: Response): Promise<any> => {
    try {

        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId })

        res.json({
            success: true,
            appointments
        })
    } catch (error: any) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}


// API to cancel appointment

const cancelAppointment = async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId, appointmentId } = req.body
        console.log("ne wid", appointmentId)

        const appointmentData = await appointmentModel.findById(appointmentId)

        // verfiy apponitment user

        if (appointmentData.userId !== userId) {
            return res.json({
                success: false,
                message: "Unauthroized action"
            })
        }


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


const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

// API to make payment of appointment using razorpay

const paymentRazorpay = async (req: Request, res: Response): Promise<any> => {
    try {
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({
                success: false,
                message: "Appointment cancelled or not found"
            })
        }

        // creating options for razorpay payment
        const options: Orders.RazorpayOrderBaseRequestBody = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY!,
            receipt: appointmentId
        }



        // creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({
            success: true,
            order
        })
    } catch (error: any) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}


// API to verify payment of razorpay
const verifyRazorpay = async (req: Request, res: Response) => {
    try {
        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
            res.json({
                success: true,
                message: "Payment Successful"
            })
        } else {
            res.json({
                success: false,
                message: "Payment Failed"
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

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay }