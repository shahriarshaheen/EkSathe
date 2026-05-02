import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Lazy storage — cloudinary is configured at request time, not at import time
// This ensures process.env vars are available when this runs
const getStorage = () => {
  console.log(
    "ENV CHECK:",
    process.env.CLOUDINARY_CLOUD_NAME,
    process.env.CLOUDINARY_API_KEY,
  );
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "eksathe/parking",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [
        { width: 1200, height: 800, crop: "limit", quality: "auto" },
      ],
    },
  });
};

// File filter — only images allowed
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// Multer instance using lazy storage
const upload = multer({
  storage: getStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 3,
  },
});

export default upload;
