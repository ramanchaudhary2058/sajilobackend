import express from "express";
import { isAuthorized } from "../middleware/isValidUser";
import {
  deleteUser,
  getAllUser,
  getUserById,
  updateUserAccount,
} from "../controller/user.controller";
import ErrorLogger from "../middleware/Logger";

const app = express.Router();

app
  .route("/:id")
  .put(isAuthorized, updateUserAccount)
  .get(isAuthorized, getUserById);

app.get("", isAuthorized, getAllUser);

app.delete("/delete/:id", isAuthorized, deleteUser);

app.use(ErrorLogger);

export default app;
