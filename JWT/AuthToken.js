import jwt from "jsonwebtoken"
import {User} from "../Models/user.model.js"

const createTokenAndSaveCookies=async(userId,res)=>{
const token=jwt.sign({userId},process.env.JWT_SECRET_KEY,{
expiresIn:"7d"
})
res.cookie("jwt",token,{
    httpOnly:true,//xss
    secure:true,
    sameSite:"strict"//csrf protection
})
await User.findByIdAndUpdate(userId,{token})
return token
}
export default createTokenAndSaveCookies