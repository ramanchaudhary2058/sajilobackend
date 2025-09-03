"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const isValidUser_1 = require("../middleware/isValidUser");
const booking_controller_1 = require("../controller/booking.controller");
const router = (0, express_1.default)();
router.post("/", isValidUser_1.bookingverifyOTP, booking_controller_1.createBooking);
router.get("/", isValidUser_1.isAuthorized, booking_controller_1.getAllBooking);
router.put("/update/:id", booking_controller_1.updateBookingById);
router.get("/byUser/:id", isValidUser_1.isAuthorized, booking_controller_1.getBookingByUserId);
router
    .route("/:id")
    .delete(isValidUser_1.isAuthorized, booking_controller_1.deleteBooking)
    .get(isValidUser_1.isAuthorized, booking_controller_1.getBookingByRoomId)
    .put(isValidUser_1.isAuthorized, booking_controller_1.updateBooking);
exports.default = router;
