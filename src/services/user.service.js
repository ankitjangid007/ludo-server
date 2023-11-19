import User from "../models/user.model.js";

export const createUser = async (userData) => {
  try {
    const newUser = new User(userData);
    const user = await newUser.save();
    return user;
  } catch (error) {
    throw new Error("Could not create user: " + error.message);
  }
};

export const getAllUsers = async () => {
  try {
    const users = await User.aggregate([
      {
        '$lookup': {
          'from': 'wallets',
          'localField': '_id',
          'foreignField': 'user',
          'as': 'walletInfo'
        }
      }, {
        '$lookup': {
          'from': 'winningcashes',
          'localField': '_id',
          'foreignField': 'user',
          'as': 'winningInfo'
        }
      }, {
        '$unwind': {
          'path': '$walletInfo'
        }
      }, {
        '$unwind': {
          'path': '$winningInfo'
        }
      }
    ]);

    if (!users) {
      throw new Error("Could not find all users");
    }
    return users;
  } catch (error) {
    throw new Error("Could not retrieve user list: " + error.message);
  }
};

export const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    throw new Error("Could not retrieve user: " + error.message);
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const user = await User.findByIdAndUpdate(userId, userData, { new: true });
    return user;
  } catch (error) {
    throw new Error("Could not update user: " + error.message);
  }
};

export const deleteUser = async (userId) => {
  try {
    await User.findByIdAndRemove(userId);
  } catch (error) {
    throw new Error("Could not delete user: " + error.message);
  }
};

export const getUserByMobileNumber = async (mobileNumber) => {
  try {
    const user = await User.findOne({ mobileNumber });
    return user;
  } catch (error) {
    throw new Error("Could not find user by mobile number: " + error.message);
  }
};

export const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    throw new Error("Could not find user by email: " + error.message);
  }
};
