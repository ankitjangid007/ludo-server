import Wallet from "../models/wallet.model.js";


// Service to get wallet by user ID
export const getWalletByUserId = async (userId) => {
  try {
    const wallet = await Wallet.findOne({ user: userId });
    return wallet;
  } catch (error) {
    throw new Error("Could not retrieve wallet: " + error.message);
  }
};

export const updateWallet = async (userId, amount) => {
  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  // if (wallet.balance < amount) {
  //   throw new Error("Insufficient funds in the wallet");
  // }

  wallet.balance += amount;
  await wallet.save();

  return wallet;
};
