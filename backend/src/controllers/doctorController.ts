import { Request, Response } from "express";
import doctorModel from "../models/doctorModel";


const changeAvailablity = async (req: Request, res: Response) => {
    try {
        const {docId} = req.body

        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, {available: !docData.available})
        res.json({
            success: true,
            message: 'Availablity Changed'
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

export default changeAvailablity