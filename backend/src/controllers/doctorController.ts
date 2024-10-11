import { Request, Response } from "express";
import doctorModel from "../models/doctorModel";


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

export { changeAvailablity, doctorList }