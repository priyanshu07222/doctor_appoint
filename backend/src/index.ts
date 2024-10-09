import express, { Request, Response } from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDb from './config/mongodb';
import connectCloudinary from './config/cloudinary';
import adminRouter from './routes/adminRoute';

// app config
const app = express();
const port = process.env.PORT || 4000
connectDb();
connectCloudinary();

// middlewares
app.use(express.json())
app.use(cors())

// api endpoint
app.use('/api/admin', adminRouter)
//  localhost:4000/api/admin/add-doctor

app.get('/', (req: Request, res: Response) => {
    res.send('API WORKING ')
})

app.listen(port, () => {
    console.log("server started at port", port)
})