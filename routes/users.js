import express from 'express';
import { getDatabase } from '../config/database.js';
import User from '../models/user.js';

const router = express.Router();

// Middleware for validating user data
const validateUserData = (req, res, next) => {
    const { name, phone } = req.body;
    try {
        User.validate({ name, phone });
        next();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// GET USERS
router.get('/', async (req, res) => {
    const db = getDatabase();
    const { page = 1, limit = 5, query = '', sortBy = '_id', sortMode = 'desc' } = req.query;
    const offset = (page - 1) * limit;
    const sort = { [sortBy]: sortMode === 'desc' ? -1 : 1 };

    try {
        const users = await User.getAll(db, { name: new RegExp(query, 'i') }, sort, offset, parseInt(limit));
        const total = await User.getCount(db, { name: new RegExp(query, 'i') });
        const pages = Math.ceil(total / limit);

        res.status(200).json({
            data: users,
            total,
            pages,
            page: parseInt(page),
            limit: parseInt(limit),
            offset
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET USER BY ID
router.get('/:id', async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;

    try {
        const user = await User.getById(db, id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE USER
router.post('/', validateUserData, async (req, res) => {
    const db = getDatabase();
    const { name, phone } = req.body;

    try {
        const newUser = new User(name, phone);
        const result = await User.save(db, newUser);
        res.status(201).json(result.ops[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE USER
router.put('/:id', validateUserData, async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const { name, phone } = req.body;

    try {
        const result = await User.update(db, id, { name, phone });
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(201).json({ _id: id, name, phone });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE USER
router.delete('/:id', async (req, res) => {
    const db = getDatabase();
    const { id } = req.params;

    try {
        const result = await User.delete(db, id);
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ _id: id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;