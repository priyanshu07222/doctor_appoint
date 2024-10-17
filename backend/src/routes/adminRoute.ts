import express from 'express'
import { addDoctor, adminDashboard, allDoctors, appointmentCancel, appointmentsAdmin, loginAdmin } from '../controllers/adminController'
import upload from '../middlewares/mutler'
import authAdmin from '../middlewares/authAdmin'
import { changeAvailablity } from '../controllers/doctorController'

const adminRouter = express.Router()


adminRouter.post('/add-doctor', authAdmin, upload.single('image'), addDoctor)
adminRouter.post('/login', loginAdmin)
adminRouter.post('/all-doctors', authAdmin, allDoctors)
adminRouter.post('/change-availability', authAdmin, changeAvailablity)
adminRouter.get('/appointments', authAdmin, appointmentsAdmin)
adminRouter.post('/cancel-appointment', authAdmin, appointmentCancel)
adminRouter.get('/dashboard', authAdmin, adminDashboard)

export default adminRouter;