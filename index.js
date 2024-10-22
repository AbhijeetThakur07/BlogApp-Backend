import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import fileUpload from 'express-fileupload'
import { v2 as cloudinary } from 'cloudinary'
import cookieParser from 'cookie-parser'
import userRoute from "./Routes/user.route.js"
import blogRoute from "./Routes/blog.route.js"

const app = express()
dotenv.config()

const port = process.env.PORT
const MONGO_URL=process.env.MONGO_URL

//middleware
app.use(express.json())
app.use(cookieParser())

app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:'/tmp/'
}))
//DB code
try{
    mongoose.connect(MONGO_URL)
    console.log("DB connected")
    }catch(err){
        console.log(err)
}

//defining routes
app.use("/api/users",userRoute)
app.use("/api/blogs",blogRoute)

//cloudinary

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.CLOUD_API_KEY, 
        api_secret: process.env.CLOUD_SECRET_KEY,
    });
    
    

app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`)
})