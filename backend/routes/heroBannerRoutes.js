const express = require("express");
const {
  createHeroBanner,
  getAllHeroBanners,
  updateHeroBanner,
  deleteHeroBanner,
  toggleHeroBannerStatus,
} = require("../controller/heroBannerController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { upload } = require("../middlewares/multerConfig");

const router = express.Router();

router.get("/", getAllHeroBanners);
router.post("/create", authMiddleware, isAdmin, upload.single("image"), createHeroBanner);
router.put("/update/:id", authMiddleware, isAdmin, upload.single("image"), updateHeroBanner);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteHeroBanner);
router.put("/toggle/:id", authMiddleware, isAdmin, toggleHeroBannerStatus);

module.exports = router;