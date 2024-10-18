import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

let dbConnection;

export const connectToDb = async () => {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    dbConnection = client.db(process.env.DB_NAME);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

export const getDb = () => {
  return dbConnection;
};