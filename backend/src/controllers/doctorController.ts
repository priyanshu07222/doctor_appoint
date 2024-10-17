import { Request, Response } from "express";
import doctorModel from "../models/doctorModel";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel";

const changeAvailablity = async (req: Request, res: Response) => {
    try {
        const { docId } = req.body

        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        res.json({
            success: true,
            message: 'Availablity Changed'
        })
    } catch (error: any) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

const doctorList = async (req: Request, res: Response) => {
    try {
        const doctors = await doctorModel.find({}).select(['-password', '-email'])
        res.json({
            success: true,
            doctors
        })
    } catch (error: any) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}


//  API for doctor Login

const loginDoctor = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body
        const doctor = await doctorModel.findOne({ email })

        if (!doctor) {
            return res.json({
                success: false,
                message: "Invalid credentials"
            })
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if (isMatch) {
            const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET!)

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


// API to get doctor appointment for doctor pnale

const appointmentsDoctor = async (req: Request, res: Response) => {
    try {
        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })

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

// API ro mark appointment completed for doctor panel

const appointmentComplete = async (req: Request, res: Response): Promise<any> => {
    try {
        const { docId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
            return res.json({
                success: true,
                message: "Appointment Completed"
            })
        } else {
            return res.json({
                success: false,
                message: "Mark failed"
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

// API to cancel appointment for doctor panel 
const appointmentCancel = async (req: Request, res: Response) => {
    try {
        const { docId, appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
            return res.json({
                success: true,
                message: "Appointment Cancelled"
            })
        } else {
            return res.json({
                success: false,
                message: "Cancellation failed"
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


// API to get dashboard data for doctor panel

const doctorDashboard = async (req: Request, res: Response) => {
    try {

        const { docId } = req.body

        const appointments = await appointmentModel.find({ docId })

        let earnings = 0

        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let patients: String[] = []

        appointments.map(((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        }))

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
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


// API to get doctor porfile for doctor panel

const doctorProfile = async (req: Request, res: Response) => {
    try {
        const { docId } = req.body
        const profileData = await doctorModel.findById(docId).select('-password')

        res.json({
            success: true,
            profileData
        })
    } catch (error: any) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

// API to update doctor profile data from Doctor pannel

const updateDoctorProfile = async (req: Request, res: Response) => {
    try {
        const { docId, fees, address, available } = req.body

        await doctorModel.findByIdAndUpdate(docId, { fees, address, available })

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

export { 
    changeAvailablity, 
    doctorList, 
    loginDoctor, 
    appointmentsDoctor, 
    appointmentCancel, 
    appointmentComplete, 
    doctorDashboard, 
    doctorProfile, 
    updateDoctorProfile
 }