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

export { changeAvailablity, doctorList, loginDoctor, appointmentsDoctor }