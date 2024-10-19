import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

let dbConnection;

export const connectToDb = async () => {
  if (dbConnection) {
    return dbConnection;
  }
  if (!process.env.MONGODB_URI || !process.env.DB_NAME) {
    console.error("Missing environment variables for MongoDB connection.");
    process.exit(1);
  }
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    dbConnection = client.db(process.env.DB_NAME);
    console.log("Successfully connected to the database.");
  } catch (err) {
    console.error("Failed to connect to the database:", err.message);
    await client.close();
    process.exit(1);
  }
  return dbConnection;
};

export const getDatabase = () => {
  if (!dbConnection) {
    console.error("Database connection is not established.");
    process.exit(1);
  }
  return dbConnection;
};