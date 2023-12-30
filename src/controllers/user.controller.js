import User from "../models/user.model.js";
import { StatusCodes } from "http-status-codes";
import { generateToken } from "../utils/generateToken.js";
import { getAllUsers } from "../services/user.service.js";
import UserActivity from "../models/userActivity.model.js";
import { Types } from "mongoose";
import { activityTags } from "../constants/activityTags.js";
import Wallet from "../models/wallet.model.js";
import WinningCash from "../models/winningCash.model.js";
import ReferralWallet from "../models/referralWallet.model.js";
import ReferralInfo from "../models/referral.model.js";

// Controller to create a new user
export const createUserOrLogin = async (req, res) => {
  const { mobileNumber } = req.body;
  const { referralId } = req.query

  try {
    const existingUser = await User.findOne({ mobileNumber });

    if (referralId) {
      const isReferralUser = await User.findById({ _id: referralId });
      if (!isReferralUser) {
        return res.status(400).json({ message: "Invalid referralId" })
      }
    }

    if (existingUser) {
      const token = generateToken(existingUser);
      // Activity log 
      UserActivity.create({ userId: existingUser.id, activityTag: activityTags.LOGIN, requestBody: req.body, requestParams: req.params, requestQuery: req.query });
      res.status(StatusCodes.OK).json({ token, role: "user",userId: existingUser.id });
    } else {

      // Create a new user if the mobile number is not found in the database
      const newUser = new User(req.body);
      const user = await newUser.save();

      // Also create wallets 
      await Wallet.create({ user: user._id });
      await WinningCash.create({ user: user._id });
      await ReferralWallet.create({ userId: user._id });

      // If referralId is coming then create referralInfo record in database
      if (referralId) {
        await ReferralInfo.create({ referralId, userId: user._id });
      }

      // Generate a token for the newly created user and send it to the client
      const token = generateToken(user);

      // Activity log 
      UserActivity.create({ userId: user.id, activityTag: activityTags.SIGNUP, requestBody: req.body, requestParams: req.params, requestQuery: req.query });

      res.cookie("userToken", token, { httpOnly: true });
      res.status(StatusCodes.CREATED).json({ token, role: "user",userId: user.id});
    }
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Controller to get all users
export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(StatusCodes.OK).json(users);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Controller to get user by ID
export const getUserById = async (req, res) => {
  try {
    const userId = new Types.ObjectId(req.decoded.userId)
    const user = await User.findById({ _id: userId });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller to update user information
export const updateUser = async (req, res) => {
  try {
    const userId = new Types.ObjectId(req.decoded.userId);
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      req.body,
      { new: true }
    );

    if (updatedUser) {
      // Activity log 
      UserActivity.create({ userId: updatedUser.id, activityTag: activityTags.PROFILE_UPDATE, requestBody: req.body, requestParams: req.params, requestQuery: req.query });
      res.json(updatedUser);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller to delete a user
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndRemove(req.params.userId);
    // Activity log 
    UserActivity.create({ userId: req.decoded.userId, activityTag: activityTags.DELETE_USER, requestBody: req.body, requestParams: req.params, requestQuery: req.query });
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
