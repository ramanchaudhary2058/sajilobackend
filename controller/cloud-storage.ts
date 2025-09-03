
import { NextFunction, Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

export const CloudStorage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { images } = req.body; // Expect array of base64 images
    
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ message: "Images array is required" });
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Upload all images in parallel
    const uploadPromises = images.map(async (image) => {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "awas",
        unique_filename: true,
      });
      return uploadResult.secure_url; // Use secure_url for HTTPS
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    
    res.status(200).json({ 
      success: true,
      imgUrls: uploadedUrls 
    });
  } catch (error) {
    next(error);
  }
};