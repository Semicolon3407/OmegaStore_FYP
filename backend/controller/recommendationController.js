const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

/**
 * Get AI-powered product recommendations based on a product ID
 * This will return both similar products and accessories
 */
const getProductRecommendations = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    // Get the source product
    const sourceProduct = await Product.findById(id);
    if (!sourceProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Get similar products based on category, brand, and tags
    const similarProducts = await Product.find({
      _id: { $ne: id }, // Exclude the current product
      $or: [
        { category: sourceProduct.category },
        { brand: sourceProduct.brand },
        { tags: { $in: sourceProduct.tags || [] } }
      ]
    })
    .sort({ sold: -1 }) // Sort by popularity (most sold first)
    .limit(4);

    // Get accessories based on complementary categories
    // This is a simplified approach - in a real AI system, you'd have more sophisticated matching
    const accessoryCategories = getComplementaryCategories(sourceProduct.category);
    
    const accessories = await Product.find({
      _id: { $ne: id }, // Exclude the current product
      category: { $in: accessoryCategories }
    })
    .sort({ sold: -1 }) // Sort by popularity
    .limit(4);

    res.json({
      success: true,
      recommendations: {
        similarProducts,
        accessories
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Helper function to determine complementary categories for a given category
 * In a real AI system, this would be based on machine learning models
 */
function getComplementaryCategories(category) {
  // Map of categories to their common accessories
  const categoryAccessoryMap = {
    "laptop": ["laptop bag", "mouse", "keyboard", "laptop stand", "headphones"],
    "smartphone": ["phone case", "screen protector", "charger", "earbuds", "power bank"],
    "camera": ["camera lens", "tripod", "camera bag", "memory card", "camera battery"],
    "headphones": ["headphone stand", "audio adapter", "earpads", "bluetooth transmitter"],
    "smartwatch": ["watch band", "watch charger", "screen protector"],
    "gaming console": ["game controller", "gaming headset", "console stand", "games"],
    "tablet": ["tablet case", "stylus", "tablet stand", "screen protector"],
    "desktop computer": ["monitor", "keyboard", "mouse", "speakers", "webcam"],
    "monitor": ["monitor stand", "hdmi cable", "monitor light", "webcam"],
    "printer": ["ink cartridge", "printer paper", "printer cable"],
    "speaker": ["audio cable", "speaker stand", "bluetooth adapter"],
    "router": ["ethernet cable", "wifi extender", "network switch"],
    "tv": ["tv mount", "hdmi cable", "remote control", "sound bar"],
    "keyboard": ["wrist rest", "keycaps", "keyboard cleaner"],
    "mouse": ["mouse pad", "mouse bungee"],
    "external hard drive": ["hard drive case", "usb cable", "data recovery software"],
    "graphics card": ["power supply", "pc case", "cooling system"],
    "processor": ["cooling fan", "thermal paste", "motherboard"],
    "motherboard": ["ram", "processor", "pc case"],
    "power bank": ["charging cable", "wireless charger"],
    "earbuds": ["earbuds case", "ear tips", "charging cable"],
    "smart home device": ["smart plug", "smart bulb", "smart switch"]
  };

  // Default to returning a mix of popular accessory categories if no specific mapping exists
  const defaultCategories = ["charger", "case", "cable", "adapter", "stand"];
  
  // Convert category to lowercase for case-insensitive matching
  const lowerCategory = category ? category.toLowerCase() : "";
  
  // Return the mapped accessories or default categories
  return categoryAccessoryMap[lowerCategory] || defaultCategories;
}

module.exports = {
  getProductRecommendations
};
