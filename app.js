import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
const __dirname = import.meta.dirname;
import { connectToDb } from "./config/database.js";

import usersRouter from "./routes/users.js";
import todosRouter from "./routes/todos.js";

const app = express();

connectToDb();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/vendor", express.static(path.join(__dirname, "public/vendor")));

app.get("/", (req, res) => {
    res.render("listUsers");
});

app.use("/users", usersRouter);
app.use("/todos", todosRouter);

app.use((req, res, next) => {
    next(createError(404));
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
});

export default app;