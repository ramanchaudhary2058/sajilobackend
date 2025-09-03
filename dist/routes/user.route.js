"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const isValidUser_1 = require("../middleware/isValidUser");
const user_controller_1 = require("../controller/user.controller");
const Logger_1 = __importDefault(require("../middleware/Logger"));
const app = express_1.default.Router();
app
    .route("/:id")
    .put(isValidUser_1.isAuthorized, user_controller_1.updateUserAccount)
    .get(isValidUser_1.isAuthorized, user_controller_1.getUserById);
app.get("", isValidUser_1.isAuthorized, user_controller_1.getAllUser);
app.delete("/delete/:id", isValidUser_1.isAuthorized, user_controller_1.deleteUser);
app.use(Logger_1.default);
exports.default = app;
