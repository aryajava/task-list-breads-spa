import express from 'express';
import { getDatabase } from '../config/database.js';
import Todo from '../models/todo.js';
import { ObjectId } from 'mongodb';
import { validateTodoId, validateTodoAdd, validateTodoUpdate } from '../middlewares/validations.js';

const router = express.Router();

// GET TODOS
router.get('/', async (req, res) => {
  const db = getDatabase();
  const { page = 1, limit = 10, title, complete, startdateDeadline, enddateDeadline, sortBy = 'deadline', sortMode = 'asc', executor } = req.query;
  const query = {};
  if (title) query.title = { $regex: title, $options: 'i' };
  if (complete !== undefined) query.complete = complete === 'true';
  if (startdateDeadline || enddateDeadline) {
    query.deadline = {};
    if (startdateDeadline && enddateDeadline) {
      // convert object date to iso string
      // covert iso string to object date
      query.deadline = { $gte: new Date(startdateDeadline).toISOString(), $lte: new Date(enddateDeadline).toISOString() };
      query.deadline = { $gte: new Date(startdateDeadline), $lte: new Date(enddateDeadline) };
    } else if (startdateDeadline) {
      query.deadline = { $gte: new Date(startdateDeadline).toISOString() };
      query.deadline = { $gte: new Date(startdateDeadline) };
    } else if (enddateDeadline) {
      query.deadline = { $lte: new Date(enddateDeadline).toISOString() };
      query.deadline = { $lte: new Date(enddateDeadline) };
    }
  }
  if (executor) query.executor = new ObjectId(executor);

  const sort = { [sortBy]: sortMode === 'desc' ? -1 : 1 };
  const offset = (page - 1) * limit;

  try {
    const todos = await Todo.getAll(db, query, sort, offset, parseInt(limit));
    const total = await Todo.getCount(db, query);
    res.status(200).json({
      data: todos,
      total,
      pages: Math.ceil(total / limit),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET TODO
router.get('/:id', validateTodoId, async (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  try {
    const todo = await Todo.getById(db, id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(200).json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE TODO
router.post('/', validateTodoAdd, async (req, res) => {
  const db = getDatabase();
  const { title, executor } = req.body;
  const todoData = { title, executor: new ObjectId(executor) };
  try {
    const result = await Todo.save(db, todoData);
    const todo = await Todo.getById(db, result.insertedId);
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE TODO
router.put('/:id', validateTodoId, validateTodoUpdate, async (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { title, complete, deadline } = req.body;
  const todoData = {
    title,
    complete,
    deadline,
  };
  try {
    const result = await Todo.update(db, id, todoData);
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    const updatedTodo = await Todo.getById(db, id);
    res.status(200).json(updatedTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE TODO
router.delete('/:id', validateTodoId, async (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  try {
    const todo = await Todo.getById(db, id);
    const result = await Todo.delete(db, id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(200).json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;