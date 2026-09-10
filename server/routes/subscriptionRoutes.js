const express = require("express");
const router = express.Router();
const { buySubscriptionOrder, verifySubscriptionPayment } = require("../controllers/subscriptionController");
const authMiddleware = require("../middleware/auth"); 


router.post("/create-order", authMiddleware, buySubscriptionOrder);
router.post("/verify-payment", authMiddleware, verifySubscriptionPayment);

module.exports = router;