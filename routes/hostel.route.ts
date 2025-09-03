import express from "express";
import { isOwner } from "../middleware/isValidUser";
import {
  createRoom,
  deleteRoom,
  getAllRoom,
  getRoomById,
  updateRoom,
} from "../controller/room.controller";

const router = express();

router.post("/", isOwner, createRoom);
router.get("/", getAllRoom);

router
  .route("/:id")
  .put(isOwner, updateRoom)
  .get(getRoomById)
  .delete(isOwner, deleteRoom);

export default router;
