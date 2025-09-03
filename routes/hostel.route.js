"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const isValidUser_1 = require("../middleware/isValidUser");
const room_controller_1 = require("../controller/room.controller");
const router = (0, express_1.default)();
router.post("/", isValidUser_1.isOwner, room_controller_1.createRoom);
router.get("/", room_controller_1.getAllRoom);
router
    .route("/:id")
    .put(isValidUser_1.isOwner, room_controller_1.updateRoom)
    .get(room_controller_1.getRoomById)
    .delete(isValidUser_1.isOwner, room_controller_1.deleteRoom);
exports.default = router;
