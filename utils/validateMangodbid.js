const mongoose = require("mongoose");

const validateMongoDBID = (id) => {
  const isValid = mongoose.Schema.Types.ObjectId.isValid(id);  // Corrected ObjectId
  if (!isValid) {
    throw new Error("This is not a valid or not found ID");
  }
};

module.exports = validateMongoDBID;
