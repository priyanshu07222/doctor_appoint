import express from 'express'
import { getProfile, loginUser, registerUser, updateProfile } from '../controllers/userController'
import authUser from '../middlewares/authUser'
import upload from '../middlewares/mutler'


const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/get-profile', authUser, getProfile)
userRouter.post('/update-profile',upload.single('image'), authUser, updateProfile)

export default userRouter