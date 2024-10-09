import express from 'express'
import { addDoctor, loginAdmin } from '../controllers/adminController'
import upload from '../middlewares/mutler'
import authAdmin from '../middlewares/authAdmin'

const adminRouter = express.Router()


adminRouter.post('/add-doctor', authAdmin, upload.single('image'), addDoctor)
adminRouter.post('/login', loginAdmin)

export default adminRouter;