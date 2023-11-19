import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  try {
    if (!token) {
      throw new Error("Token is missing");
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        throw new Error("Invalid token");
      }
      req.decoded = decoded;
      next();
    });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};
