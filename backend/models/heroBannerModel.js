const mongoose = require("mongoose");

const heroBannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    highlightedTitle: { type: String, required: true },
    description: { type: String, required: true },
    highlightedDescription: { type: String },
    image: { type: String, required: true },
    backgroundColor: { type: String, default: "bg-gradient-to-br from-gray-900 via-black to-gray-950" },
    offerTitle: { type: String, default: "SHIELD+ Protection" },
    offerWorth: { type: String, default: "Worth NPR 13,000" },
    offerItems: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HeroBanner", heroBannerSchema);