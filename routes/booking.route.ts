import express from "express";
import { bookingverifyOTP, isAuthorized} from "../middleware/isValidUser";



import {

  createBooking,
  deleteBooking,
  getAllBooking,
  getBookingByRoomId,
  getBookingByUserId,
  updateBooking,
  updateBookingById,
} from "../controller/booking.controller";

const router = express();
router.post("/", bookingverifyOTP ,createBooking);
router.get("/", isAuthorized, getAllBooking);
router.put("/update/:id", updateBookingById);
router.get("/byUser/:id", isAuthorized, getBookingByUserId);

router
  .route("/:id")
  .delete(isAuthorized, deleteBooking)
  .get(isAuthorized, getBookingByRoomId)
  .put(isAuthorized, updateBooking);

export default router;
