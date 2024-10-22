import { Blog } from "../Models/blog.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createBlog = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send({ message: "Blog image is required." });
    }
    const { blogImage } = req.files;
    const allowedFormats = [
      "image/jpg",
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedFormats.includes(blogImage.mimetype)) {
      return res
        .status(400)
        .send({
          message:
            "Invalid photo format.Only jpg,jpeg,webp and png are allowed",
        });
    }
    const { title, category, about } = req.body;
    if (!title || !category || !about) {
      return res
        .status(400)
        .json({ message: "Title,category and about are required" });
    }

    const adminName = req?.user?.name; //? optional chaining
    const adminPhoto = req?.user?.photo;
    const createdBy = req?.user?._Id;
    const cloudinaryResponse = await cloudinary.uploader.upload(
      blogImage.tempFilePath
    );

    if (!cloudinaryResponse || cloudinaryResponse.error) {
      return res.status(400).json({ message: "Failed to upload photo" });
    }

    const blogData = {
      title,
      about,
      category,
      adminName,
      adminPhoto,
      createdBy,
      blogImage: {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.url,
      },
    };
    const blog = await Blog.create(blogData);
    res.status(201).json({
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }
  await blog.deleteOne();
  res.status(200).json({ message: "Blog deleted successfully" });
};

export const getAllBlogs = async (req, res) => {
  const allBlogs = await Blog.find();
  res.status(200).json(allBlogs);
};

export const getSingleBlog = async (req, res) => {
  const { id } = req.params;
  if(!mongoose.Types.ObjectId.isValid(id)){
    return res.status(404).json({ message: "Invalid blog id" });
  }
  const blog = await Blog.findById(id);
  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }
  res.status(200).json(blog);
};

export const getMyBlogs=async(req,res)=>{
    const{id}=req.user._id
    const myBlogs=await Blog.find({createdBy})
    res.status(200).json(myBlogs)
}
export const updateBlog=async(req,res)=>{
    const{id}=req.params
    if(!mongoose.Types.ObjectId,isValid(id)){
        return res.status(400).json({message:"Invalid Blog id"})
    }
    const updatedBlog=await Blog.findByIdAndUpdate(id,req.body,{new:true})
    if(!updatedBlog){
        return res.status(404).json({message:"Blog not found"})
    }
    res.status(200).json(updatedBlog)
}