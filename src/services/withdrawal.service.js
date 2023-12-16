import WinningCash from "../models/winningCash.model.js";
import Withdrawal from "../models/withrawal.modal.js";

export const createWithdrawal = async (paymentData) => {
  try {
    const payment = new Withdrawal(paymentData);
    return await payment.save();
  } catch (error) {
    throw new Error("Couldn't create withrawal");
  }
};

export const getWithdrawal = async () => {
  try {
    return await Withdrawal.aggregate([
      {
        '$lookup': {
          'from': 'users',
          'localField': 'userId',
          'foreignField': '_id',
          'as': 'userInfo'
        }
      }, {
        '$unwind': {
          'path': '$userInfo'
        }
      }
    ]);
  } catch (error) {
    throw new Error("Couldn't get Withdrawal request");
  }
};

export const getWithdrawalByUserId = async (userId) => {
  try {
    return await Withdrawal.find({ userId }).exec();
  } catch (error) {
    throw new Error("Couldn't get withrawal request");
  }
};

export const updateWithdrawalRequest = async (withdrawalId, paymentData) => {
  console.log(withdrawalId, paymentData);
  try {
    const record = await Withdrawal.findOne({ _id: withdrawalId });
    if (!record) {
      throw new Error("Couldn't find Withdrawal record");
    }
    record.status = paymentData.status;
    if (paymentData.status === "rejected") {
      const wallet = await WinningCash.findOne({ user: record.userId });
      if (!wallet) {
        throw new Error("Couldn't find user's winningCash wallet");
      }
      wallet.balance += record.amount;
      await wallet.save();
    }
    return await record.save();
  } catch (error) {
    console.log(error.message);
    throw new Error("Couldn't update withdrawal request");
  }
};
