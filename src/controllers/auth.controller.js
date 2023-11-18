import { activityTags } from "../constants/activityTags.js";
import UserActivity from "../models/userActivity.model.js";
import { adminLogin, createAdminUser } from "../services/auth.service.js";
import { generateToken } from "../utils/generateToken.js";

export const createAdminUserController = async (req, res) => {
  try {
    const user = await createAdminUser(req.body);
    // Activity log 
    UserActivity.create({ userId: null, activityTag: activityTags.ADMIN_ADDED, requestBody: req.body, requestParams: req.params, requestQuery: req.query });
    res.json(updatedUser);
    res.status(201).json({ user });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const adminLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await adminLogin(email, password);
    const token = generateToken(user);
    
    // Activity log 
    UserActivity.create({ userId: user.id, activityTag: activityTags.ADMIN_LOGIN, requestBody: req.body, requestParams: req.params, requestQuery: req.query });
    res.cookie("userToken", token, { httpOnly: true });
    res.status(200).json({ token, role: "admin" });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
