import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

// doctor authentication middleware

const authDoctor = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { dtoken } = req.headers
        if (!dtoken || Array.isArray(dtoken)) {
            return res.json({
                success: false,
                message: "Not Authorized Login Again"
            })
        }



        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET!) as JwtPayload

        req.body.docId = token_decode.id
        next()

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error })
    }
}

export default authDoctor