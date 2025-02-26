const mongoose = require("mongoose");

const validateMongoDBID = (id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);  // Corrected ObjectId validation
  if (!isValid) {
    throw new Error("This is not a valid or not found ID");
  }
};

module.exports = validateMongoDBID;
