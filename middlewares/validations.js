import { getDatabase } from "../config/database.js";
import User from "../models/user.js";
import Todo from "../models/todo.js";
import { ObjectId } from "mongodb";

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

export const validateUserData = (req, res, next) => {
  const { name, phone } = req.body;
  try {
    if (!name || typeof name !== "string") {
      throw new Error("Name is required and must be a string.");
    }
    if (!phone || typeof phone !== "string") {
      throw new Error("Phone is required and must be a string.");
    }
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

export const validateTodoAdd = (req, res, next) => {
  const { title, executor } = req.body;
  try {
    if (!title || typeof title !== "string") {
      throw new Error("Title is required and must be a string.");
    }
    if (!executor || !ObjectId.isValid(executor)) {
      throw new Error("Executor must be a valid ObjectId.");
    }
    next();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export const validateTodoUpdate = (req, res, next) => {
  const { title, complete, deadline } = req.body;
  try {
    if (!title || typeof title !== "string") {
      throw new Error("Title is required and must be a string.");
    }
    if (complete !== undefined && typeof complete !== "boolean") {
      throw new Error("Complete must be a boolean.");
    }
    if (deadline !== undefined) {
      const parsedDeadline = new Date(deadline);
      if (isNaN(parsedDeadline.getTime())) {
        throw new Error("Deadline must be a valid Date.");
      }
      req.body.deadline = parsedDeadline;
    }
    next();
  } catch (err) {
    console.log(`Error: `, err);

    res.status(400).json({ error: err.message });
  }
}