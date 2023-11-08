import Razorpay from "razorpay";
import dotenv from "dotenv";
import shortid from "shortid";

dotenv.config();

export const razorpayInstance = new Razorpay({
  key_id: process.env.PAYMENT_GATEWAY_API_KEY,
  key_secret: process.env.PAYMENT_GATEWAY_API_SECRET,
});

export const addRazorpayCash = async (req, res) => {
  const { amount } = req.body;

  const payment_capture = 1;
  const currency = "INR";

  const options = {
    amount: amount * 100,
    currency,
    receipt: shortid.generate(),
    payment_capture,
  };

  try {
    const response = await razorpayInstance.orders.create(options);
    logger.info(response);
    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.log(error);
  }
};

export const withdrawRazorpayCash = async (req, res) => {
  const { bankAccount, amount } = req.body;

  const payout = {
    account_number: bankAccount, // Bank account details of the recipient
    amount: amount * 100,
    currency: "INR",
    method: "bank_account",
  };

  try {
    const payoutResponse = await razorpayInstance.payouts.create(payout);
    logger.info(payoutResponse);

    res.json({ message: "Payout successful", payoutResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payout failed" });
  }
};
