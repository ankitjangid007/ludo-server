// userRoutes.js
import express from "express";
import {
  createUserOrLogin,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsersController,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

// Create a new user
router.post("/", createUserOrLogin);

// Get all users
router.get("/", verifyToken, getAllUsersController);

// Get user by ID
router.get("/:userId", verifyToken, getUserById);

// Update user information
router.patch("/:userId", verifyToken, updateUser);

// Delete a user
router.delete("/:userId", verifyToken, deleteUser);

export default router;
