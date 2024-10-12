import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

// user authentication middleware

const authUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { token } = req.headers
        if (!token || Array.isArray(token)) {
            return res.json({
                success: false,
                message: "Not Authorized Login Again"
            })
        }



        const token_decode = jwt.verify(token, process.env.JWT_SECRET!)

        req.body.userId = token_decode.id
        next()
        
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error })
    }
}

export default authUser