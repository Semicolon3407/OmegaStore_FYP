const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// Ensure directories exist
const productDir = path.join(__dirname, "../public/images/products");
const blogDir = path.join(__dirname, "../public/images/blogs");

if (!fs.existsSync(productDir)) {
  fs.mkdirSync(productDir, { recursive: true });
}
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images/"));
  },
  filename: function (req, file, cb) {
    const uniquesuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase(); // Preserve original extension
    cb(null, file.fieldname + "-" + uniquesuffix + ext);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};

const uploadPhoto = multer({
  storage: storage,
  fileFilter: multerFilter,
  limits: { fileSize: 5000000 }, 
});

const productImgResize = async (req, res, next) => {
  if (!req.files) return next();
  await Promise.all(
    req.files.map(async (file) => {
      const ext = path.extname(file.filename).toLowerCase();
      let format;
      switch (ext) {
        case ".png":
          format = "png";
          break;
        case ".webp":
          format = "webp";
          break;
        case ".gif":
          format = "gif";
          break;
        default:
          format = "jpeg"; // Fallback to JPEG for other formats
      }

      await sharp(file.path)
        .resize(300, 300)
        .toFormat(format, { quality: format === "jpeg" ? 90 : undefined }) // Quality for JPEG only
        .toFile(path.join(productDir, file.filename));
      fs.unlinkSync(file.path); // Remove the original file
    })
  );
  next();
};

const blogImgResize = async (req, res, next) => {
  if (!req.files) return next();
  await Promise.all(
    req.files.map(async (file) => {
      const ext = path.extname(file.filename).toLowerCase();
      let format;
      switch (ext) {
        case ".png":
          format = "png";
          break;
        case ".webp":
          format = "webp";
          break;
        case ".gif":
          format = "gif";
          break;
        default:
          format = "jpeg"; // Fallback to JPEG for other formats
      }

      await sharp(file.path)
        .resize(300, 300)
        .toFormat(format, { quality: format === "jpeg" ? 90 : undefined })
        .toFile(path.join(blogDir, file.filename));
      fs.unlinkSync(file.path); // Remove the original file
    })
  );
  next();
};

module.exports = { uploadPhoto, productImgResize, blogImgResize };