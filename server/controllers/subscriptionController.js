const Razorpay = require("razorpay");
const crypto = require("crypto"); 
const User = require("../models/User");
const Payment = require("../models/Payment"); 
const nodemailer = require("nodemailer");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


exports.buySubscriptionOrder = async (req, res) => {
  try {
   
    const now = new Date();
    const totalMinutesUTC = now.getUTCHours() * 60 + now.getUTCMinutes();
    const totalMinutesIST = totalMinutesUTC + 330; // UTC + 5:30
    const istHour = Math.floor(totalMinutesIST / 60) % 24;

  //  Allow ONLY between 10:00 AM and 10:59 AM IST
    if (istHour < 10 || istHour >= 11) {
      return res.status(400).json({
        success: false,
        message: "Payments are allowed only between 10:00 AM and 11:00 AM (IST)!",
      });
    }

    const { plan } = req.body;
    let price = 0;

    if (plan === "Bronze") price = 100;
    else if (plan === "Silver") price = 300;
    else if (plan === "Gold") price = 1000;
    else {
      return res.status(400).json({
        success: false,
        message: "Invalid plan type Selected",
      });
    }

    const options = {
      amount: price * 100,
      currency: "INR",
      receipt: `sub_rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      plan, 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.verifySubscriptionPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;                      

    const userId = req.user.id;

    
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Invalid signature",
      });
    }

    
    const order = await razorpay.orders.fetch(razorpay_order_id);
    if (!order || order.status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }

  
    const amountPaid = order.amount; 
    let plan, limits;
    if (amountPaid === 10000)       { plan = "Bronze"; limits = 3; }
    else if (amountPaid === 30000)  { plan = "Silver"; limits = 5; }
    else if (amountPaid === 100000) { plan = "Gold";   limits = 999999; }
    else {
      return res.status(400).json({ success: false, message: "Unknown payment amount" });
    }

    
    const existingPayment = await Payment.findOne({ razorpay_order_id });
    if (existingPayment) {
      return res.status(200).json({ success: true, message: "Payment already recorded" });
    }

   
    await Payment.create({
      userId,
      razorpay_order_id,
      type: "subscription",
      planName: plan.toLowerCase(),
      amount: amountPaid / 100,      
      paymentDate: new Date(),
    });

   
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        subscription: plan,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        allowedApplications: limits,
        monthlyApplicationsCount: 0,
      },
      { new: true }
    );

    
    try {
     
      await transporter.sendMail(mailOptions);
    } catch (emailErr) {
      console.error("Invoice email failed (payment is safe):", emailErr.message);
    }

    res.status(200).json({
      success: true,
      message: "Subscription activated! 🚀",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Subscription verify error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};