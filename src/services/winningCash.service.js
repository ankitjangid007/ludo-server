import WinningCash from "../models/winningCash.model.js";

// Service to create a wallet for a user
export const createWinCashWallet = async (userId) => {
  try {
    const existingWallet = await WinningCash.findOne({ user: userId });

    if (!existingWallet) {
      const newWallet = new WinningCash({ user: userId });
      await newWallet.save();
      return newWallet;
    }

    return existingWallet;
  } catch (error) {
    throw new Error("Could not create Winning Cash Wallet: " + error.message);
  }
};

export const updateWinCashWallet = async (userId) => {
  try {
    const wallet = await WinningCash.findOne({ user: userId });
    if (!wallet) throw new Error("Could not find wallet");

    wallet.balance += battle.totalPrize;
    return await wallet.save();
  } catch (error) {
    throw new Error("Could not update Winning Cash Wallet: " + error.message);
  }
};

// Service to get wallet by user ID
export const getWinningCashWalletByUserId = async (userId) => {
  try {
    const wallet = await WinningCash.findOne({ user: userId });
    return wallet;
  } catch (error) {
    throw new Error("Could not retrieve wallet: " + error.message);
  }
};

export const deductFromWinningCashWallet = async (userId, amountToDeduct) => {
  const wallet = await WinningCash.findOne({ user: userId });

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
