import express from 'express'
import { login,register,logout,getMyProfile,getAdmins } from '../Controllers/user.controller.js'
import { isAuthenticated } from '../Middleware/authUser.js' 


const router=express.Router()

router.post("/register",register)
router.post("/login",login)
router.get("/logout",isAuthenticated,logout)
router.get("/my-profile",isAuthenticated,getMyProfile)
router.get("/admins",getAdmins)


export default router