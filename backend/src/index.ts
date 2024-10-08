import express, { Request, Response } from 'express'
import cors from 'cors'
import 'dotenv/config'

// app config
const app = express();
const port = process.env.PORT || 4000

// middlewares
app.use(express.json())
app.use(cors())

// api endpoint

app.get('/', (req: Request, res: Response) => {
    res.send('API WORKING ')
})

app.listen(port, () => {
    console.log("server started at port", port)
})