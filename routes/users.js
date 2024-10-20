import express from 'express';
import { getDatabase } from '../config/database.js';
import User from '../models/user.js';
import { validateUserData, validUserId } from '../middlewares/validations.js';

const router = express.Router();

// GET USERS
router.get('/', async (req, res) => {
    const db = getDatabase();
    const { page = 1, limit = 5, search = '', sortBy = '_id', sortMode = 'desc' } = req.query;

    try {
        let users;
        const offset = (page - 1) * limit;
        const sort = { [sortBy]: sortMode === 'desc' ? -1 : 1 };
        const searchQuery = {
            $or: [{ name: new RegExp(search, "i") }, { phone: new RegExp(search, "i") }],
        };
        if (parseInt(limit) === 0) {
            users = await User.getAll(db, searchQuery, sort);
        } else {
            users = await User.getAll(db, searchQuery, sort, offset, parseInt(limit));
        }
        const total = await User.getCount(db, searchQuery);
        const pages = parseInt(limit) === 0 ? 1 : Math.ceil(total / limit);

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
router.get('/:id', validUserId, async (req, res) => {
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
        res.status(201).json({ _id: result.insertedId, name, phone });
    } catch (err) {
        console.error('Error creating user', err);
        res.status(500).json({ error: err.message });
    }
});

// UPDATE USER
router.put('/:id', validUserId, validateUserData, async (req, res) => {
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
router.delete('/:id', validUserId, async (req, res) => {
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

// GET USER'S TODOS
router.get('/:id/todos', validUserId, async function (req, res) {
    res.render('listTodos', { userId: req.params.id });
})

export default router;