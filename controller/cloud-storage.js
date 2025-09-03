"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudStorage = void 0;
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const CloudStorage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { images } = req.body; // Expect array of base64 images
        if (!images || !Array.isArray(images)) {
            return res.status(400).json({ message: "Images array is required" });
        }
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        // Upload all images in parallel
        const uploadPromises = images.map((image) => __awaiter(void 0, void 0, void 0, function* () {
            const uploadResult = yield cloudinary_1.v2.uploader.upload(image, {
                folder: "awas",
                unique_filename: true,
            });
            return uploadResult.secure_url; // Use secure_url for HTTPS
        }));
        const uploadedUrls = yield Promise.all(uploadPromises);
        res.status(200).json({
            success: true,
            imgUrls: uploadedUrls
        });
    }
    catch (error) {
        next(error);
    }
});
exports.CloudStorage = CloudStorage;
