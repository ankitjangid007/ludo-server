import Wallet from "../models/wallet.model.js";

// Service to create a wallet for a user
export const createWallet = async (userId) => {
  try {
    const existingWallet = await Wallet.findOne({ user: userId });

    console.log("wallet::", existingWallet);

    if (existingWallet) {
      return existingWallet;
    }

    const newWallet = new Wallet({ user: userId });
    await newWallet.save();
    return newWallet;
  } catch (error) {
    throw new Error("Could not create wallet: " + error.message);
  }
};

// Service to get wallet by user ID
export const getWalletByUserId = async (userId) => {
  try {
    const wallet = await Wallet.findOne({ user: userId });
    return wallet;
  } catch (error) {
    throw new Error("Could not retrieve wallet: " + error.message);
  }
};

export const deductFromWallet = async (userId, amountToDeduct) => {
  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  if (wallet.balance < amountToDeduct) {
    throw new Error("Insufficient funds in the wallet");
  }

  wallet.balance -= amountToDeduct;
  await wallet.save();

  return wallet;
};
