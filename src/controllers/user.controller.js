import User from "../models/user.model.js";
import { StatusCodes } from "http-status-codes";
import { generateToken } from "../utils/generateToken.js";

// Controller to create a new user
export const createUserOrLogin = async (req, res) => {
  const { mobileNumber } = req.body;

  try {
    const existingUser = await User.findOne({ mobileNumber });

    if (existingUser) {
      const token = generateToken(existingUser);
      res.status(StatusCodes.OK).json({ token });
    } else {
      // Create a new user if the mobile number is not found in the database
      const newUser = new User(req.body);
      const user = await newUser.save();

      // Generate a token for the newly created user and send it to the client
      const token = generateToken(user);
      res.cookie("userToken", token, { httpOnly: true });
      res.status(StatusCodes.CREATED).json({ token, role: "user" });
    }
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

// Controller to get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
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
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true }
    );
    if (updatedUser) {
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
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
