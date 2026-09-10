const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ───── RAZORPAY ───── */
    razorpay_order_id: { type: String, unique: true, sparse: true, index: true },
    razorpay_payment_id: { type: String, default: "" },
    razorpay_signature: { type: String, default: "" },

    /* ───── PRODUCT ───── */
    type: {
      type: String,
      enum: ["subscription", "premium_resume"],
      required: true,
      index: true,
    },
    planName: {
      type: String,
      enum: ["bronze", "silver", "gold", "premium_resume", "Bronze", "Silver", "Gold"],
      required: true,
    },

    /* ───── MONEY ───── */
    amount: { type: Number, required: true },      // rupees me
    currency: { type: String, default: "INR" },

    status: {
      type: String,
      enum: ["success", "pending", "failed"],
      default: "success",
      index: true,
    },

    description: { type: String, default: "" },
    paymentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);