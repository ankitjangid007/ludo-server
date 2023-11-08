import { adminLogin, createAdminUser } from "../services/auth.service.js";
import { generateToken } from "../utils/generateToken.js";

export const createAdminUserController = async (req, res) => {
  try {
    const user = await createAdminUser(req.body);
    res.status(201).json({ token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const adminLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await adminLogin(email, password);
    const token = generateToken(user);
    res.cookie("userToken", token, { httpOnly: true });
    res.status(200).json({ token, role: "admin" });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
