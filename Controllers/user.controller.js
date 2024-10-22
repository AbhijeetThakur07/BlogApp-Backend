import{User} from "../Models/user.model.js"
import { v2 as cloudinary } from 'cloudinary'
import bcrypt from "bcryptjs"
import createTokenAndSaveCookies from "../JWT/AuthToken.js"

export const register=async(req,res)=>{
 try{
    if(!req.files || Object.keys(req.files).length===0){
        return res.status(400).send({message:"No files were uploaded."})
    }
    const {photo}=req.files
    const allowedFormats=["image/jpg","image/png","image/jpeg","image/webp"]

    if(!allowedFormats.includes(photo.mimetype)){
        return res.status(400).send({message:"Invalid photo format.Only jpg,jpeg,webp and png are allowed"})
    }
    const{email,name,password,phone,education,role}=req.body
    if(!email || !name||!password||!phone||!education||!role||!photo){
        return res.status(400).json({message:"All fields are required"})
    }
    const user=await User.findOne({email})
    if(user){
        return res.status(400).json({message:"Email already exists"})
    }

    const cloudinaryResponse=await cloudinary.uploader.upload(
        photo.tempFilePath,   
    )

    if(!cloudinaryResponse||cloudinaryResponse.error){
        return res.status(400).json({message:"Failed to upload photo"})
    }

    //hash password
    const hashedPassword=await bcrypt.hash(password,10)
    const newUser=new User({
        email,
        name,
        password:hashedPassword,
        phone,
        education,
        role,
        photo:{
        public_id:cloudinaryResponse.public_id,
        url:cloudinaryResponse.url,
    },
})
    await newUser.save()
    if(newUser){
        const token=await createTokenAndSaveCookies(newUser._id,res)
        console.log("Signup: ",token)
        res
        .status(201)
        .json({message:"User registered successfully",newUser,token})
    }
 }
 catch(error){
    res.status(500).json({message:error.message})
 }
};

export const login=async(req,res)=>{
    const{email,password,role}=req.body
    try{
        if(!email||!password||!role)
        {
            return res.status(400).json({message:"All fields are required"})
        }
        const user=await User.findOne({email}).select("+password")
        if(!user.password){
            return res.status(400).json({message:"User password is missing"})
        }

        const isMatch=await bcrypt.compare(password,user.password)
        if(!user||!isMatch){
            return res.status(400).json({message:"Invalid email or password"})
        }
        if(user.role!==role){
            return res.status(400).json({message:`Given role ${role} not found`})
        }
        const token=await createTokenAndSaveCookies(user._id,res)
        console.log("Login: ",token)
        res.status(200).json({message:"User logged in successfully",
            user:{
            _id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,
        },token:token})
    }
    catch(error){
        return res.status(500).json({error:"Internal Server Error"})
    }
};

export const logout =(req,res)=>{
   try{
    res.clearCookie("jwt")
    res.status(200).json({message:"User logged out successfully"})
   }
   catch(error){
    res.status(500).json({error:"Internal Server Error"})
   }
}

export const getMyProfile=async(req,res)=>{
    const user=await req.user
    res.status(200).json(user)
}
export const getAdmins=async(req,res)=>{
    const admins=await User.find({role:"admin"})
    res.status(200).json(admins)
}