const mongoose = require("mongoose");

const validateMongoDbId = (id) => {
  // Check if id is undefined or not a valid ObjectId
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    // Don't throw an error for route names - this is likely the issue
    if (id === "carts" || id === "cart") {
      console.warn(`Not validating route name as MongoDB ID: ${id}`);
      return false;
    }
    throw new Error(`Invalid ID: ${id}`);
  }
  return true;
};

module.exports = validateMongoDbId;