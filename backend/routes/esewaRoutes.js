const express = require("express");
const {
  initiateEsewaPayment,
  verifyEsewaPayment,
  handlePaymentFailure,
} = require("../controller/esewaController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

// Initiate eSewa payment
router.post("/initiate-payment", authMiddleware, initiateEsewaPayment);

// Verify eSewa payment
router.get("/verify-payment", verifyEsewaPayment);

// Handle payment failure
router.get("/payment-failure", handlePaymentFailure);

module.exports = router;