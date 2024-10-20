import { getDatabase } from "../config/database.js";
import User from "../models/user.js";
import Todo from "../models/todo.js";

export const validUserId = async (req, res, next) => {
  const db = getDatabase();
  const { id } = req.params;

  try {
    const user = await User.getById(db, id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const validateUserData = async (req, res, next) => {
  const { name, phone } = req.body;
  try {
    await User.validate({ name, phone });
    next();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const validateTodoId = async (req, res, next) => {
  const db = getDatabase();
  const { id } = req.params;
  try {
    const todo = await Todo.getById(db, id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const validateTodoData = async (req, res, next) => {
  const { id } = req.params;
  const { title, executor, complete, deadline } = req.body;
  try {
    if (!complete && !deadline) {
      await Todo.validate({ title, executor });
    } else {
      await Todo.validate({ title, complete, deadline: new Date(deadline), executor: id });
    }

    next();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}