const express = require("express");
const { getProductRecommendations } = require("../controller/recommendationController");

const router = express.Router();

// Get AI recommendations for a specific product
router.get("/products/:id", getProductRecommendations);

module.exports = router;
