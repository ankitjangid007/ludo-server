import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  const payload = {
    userId: user._id,
  };

  // Secret key for signing the token (keep it secret and secure)
  const secretKey = process.env.JWT_SECRET;

  const options = {
    expiresIn: "30d", // Token will expire in 30 days
  };

  // Generate the JWT token
  const token = jwt.sign(payload, secretKey, options);

  return token;
};
