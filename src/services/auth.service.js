import Admin from "../models/admin.model.js";

export const createAdminUser = async (userData) => {
  try {
    const newUser = new Admin(userData);
    const user = await newUser.save();

    return user;
  } catch (error) {
    throw new Error("Failed to create admin user:" + error.message);
  }
};

export const adminLogin = async (email, password) => {
  try {
    const user = await Admin.findOne({ email, password });
    if (!user) {
      throw new Error("Admin authentication failed");
    }
    return user;
  } catch (error) {
    throw new Error("Admin authentication failed: " + error.message);
  }
};
