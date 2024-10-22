import { ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

export default class User {
    constructor(name, phone) {
        this.name = name;
        this.phone = phone;
    }

    static async getAll(db, query = {}, sort = {}, offset = 0, limit = 0) {
        const usersCollection = db.collection(process.env.USERS_COLLECTION);
        if (limit === 0) {
            return await usersCollection.find(query).sort(sort).toArray();
        } else {
            return await usersCollection.find(query).sort(sort).skip(offset).limit(limit).toArray();
        }
    }

    static async getById(db, userId) {
        const usersCollection = db.collection(process.env.USERS_COLLECTION);
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        return user;
    }

    static async getCount(db, query = {}) {
        const usersCollection = db.collection(process.env.USERS_COLLECTION);
        return await usersCollection.countDocuments(query);
    }

    static async save(db, userData) {
        const usersCollection = db.collection(process.env.USERS_COLLECTION);
        const result = await usersCollection.insertOne(userData);
        return result;
    }

    static async update(db, userId, userData) {
        const usersCollection = db.collection(process.env.USERS_COLLECTION);
        const result = await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: userData });
        return result;
    }

    static async delete(db, userId) {
        const usersCollection = db.collection(process.env.USERS_COLLECTION);
        const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
        return result;
    }
}