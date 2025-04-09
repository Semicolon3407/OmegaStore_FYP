const HeroBanner = require("../models/heroBannerModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMangodbid");

// Create Hero Banner
const createHeroBanner = asyncHandler(async (req, res) => {
  const {
    title,
    highlightedTitle,
    description,
    highlightedDescription,
    backgroundColor,
    offerTitle,
    offerWorth,
    offerItems,
  } = req.body;

  console.log("Request Body:", req.body);
  console.log("File:", req.file);

  if (!title || !highlightedTitle || !description || !req.file) {
    return res.status(400).json({ message: "Title, highlighted title, description, and image are required" });
  }

  const existingBanner = await HeroBanner.findOne({ title, highlightedTitle });
  if (existingBanner) {
    return res.status(400).json({ message: "A banner with this title and highlighted title already exists" });
  }

  const parsedOfferItems = offerItems
    ? JSON.parse(offerItems)
    : [
        { title: "Extended Warranty", description: "1 Year" },
        { title: "Front Screen", description: "1 Replacement" },
        { title: "Back Glass", description: "1 Replacement" },
      ];

  if (parsedOfferItems.length !== 3) {
    return res.status(400).json({ message: "Exactly 3 offer items are required" });
  }

  const heroBanner = new HeroBanner({
    title,
    highlightedTitle,
    description,
    highlightedDescription: highlightedDescription || "",
    image: `/uploads/hero-banners/${req.file.filename}`,
    backgroundColor: backgroundColor || "bg-gradient-to-br from-gray-900 via-black to-gray-950",
    offerTitle: offerTitle || "SHIELD+ Protection",
    offerWorth: offerWorth || "Worth NPR 13,000",
    offerItems: parsedOfferItems,
  });

  const createdBanner = await heroBanner.save();
  res.status(201).json(createdBanner);
});

// Get All Hero Banners (only active ones)
const getAllHeroBanners = asyncHandler(async (req, res) => {
  const banners = await HeroBanner.find({ isActive: true }).sort({ createdAt: -1 });
  console.log("Active banners sent to frontend:", banners);
  res.json(banners);
});

// Update Hero Banner
const updateHeroBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  const updateData = { ...req.body };
  if (req.file) {
    updateData.image = `/uploads/hero-banners/${req.file.filename}`;
  }
  if (updateData.offerItems) {
    updateData.offerItems = JSON.parse(updateData.offerItems);
    if (updateData.offerItems.length !== 3) {
      return res.status(400).json({ message: "Exactly 3 offer items are required" });
    }
  }

  const updatedBanner = await HeroBanner.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedBanner) {
    return res.status(404).json({ message: "Hero banner not found" });
  }

  res.json(updatedBanner);
});

// Delete Hero Banner
const deleteHeroBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  const deletedBanner = await HeroBanner.findByIdAndDelete(id);
  if (!deletedBanner) {
    return res.status(404).json({ message: "Hero banner not found" });
  }

  res.json({ message: "Hero banner deleted successfully" });
});

// Toggle Hero Banner Active Status
const toggleHeroBannerStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  const banner = await HeroBanner.findById(id);
  if (!banner) {
    return res.status(404).json({ message: "Hero banner not found" });
  }

  banner.isActive = !banner.isActive;
  const updatedBanner = await banner.save();
  res.json(updatedBanner);
});

module.exports = {
  createHeroBanner,
  getAllHeroBanners,
  updateHeroBanner,
  deleteHeroBanner,
  toggleHeroBannerStatus,
};