import mongoose from "mongoose";
import logger from "./logger.js";

// Function to connect to the database
export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Value for connection timeout
    });

    logger.info("Database connection successful");
  } catch (error) {
    logger.error(error, "Failed to connect to database");

    // Handle the error gracefully or retry connection
    process.exit(1);
  }
};

// Function to disconnect from the database
export const disconnectFromDatabase = async () => {
  await mongoose.connection.close();
  logger.info("Database disconnected");
  return;
};
