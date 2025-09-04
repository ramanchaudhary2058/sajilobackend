"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBooking = exports.getBookingByUserId = exports.getBookingByRoomId = exports.getAllBooking = exports.updateBooking = exports.createBooking = exports.updateBookingById = void 0;
const db_1 = require("../db");
const utils_1 = require("../utils");
const RealTime_1 = require("../real-time/RealTime");
const const_1 = require("../const");
const CusomError_1 = __importDefault(require("../middleware/CusomError"));
// ----------------- Create Booking -----------------
// ✅ Update booking by ID
const updateBookingById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { checkOutDate, remark } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Booking ID is required" });
        }
        const query = `
      UPDATE bookings 
      SET 
        checkOutDate = ?, 
        remark = ?, 
        isActiveStatus = CASE 
          WHEN ? IS NOT NULL THEN false   -- auto set inactive if checkout date is added
          ELSE isActiveStatus 
        END
      WHERE id = ? 
      AND isActiveStatus = true;          -- ✅ only update if active
    `;
        const [result] = yield db_1.pool.query(query, [
            checkOutDate || null,
            remark || null,
            checkOutDate,
            id,
        ]);
        if (result.affectedRows === 0) {
            return res
                .status(404)
                .json({ message: "Booking not found or already inactive" }); // ✅ clear message
        }
        res.status(200).json({ message: "Booking updated successfully" });
    }
    catch (error) {
        console.error("Update Booking Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.updateBookingById = updateBookingById;
const createBooking = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const data = req.body;
        const checkOutDate = (_a = data.checkOutDate) !== null && _a !== void 0 ? _a : null;
        // 🔍 Check if room is already booked by any user with isActiveStatus = true
        const [activeRoomBookings] = yield db_1.pool.query(`SELECT id 
       FROM bookings 
       WHERE roomId = ? AND isActiveStatus = true 
       LIMIT 1`, [data.roomId]);
        if (activeRoomBookings.length > 0) {
            return res.status(400).json({
                message: "This room is already booked and active. Cannot create a new booking."
            });
        }
        // 🔍 Original user-specific booking check
        const [existingBookings] = yield db_1.pool.query(`SELECT id, status 
       FROM bookings 
       WHERE userId = ? AND roomId = ? 
       ORDER BY createdAt DESC 
       LIMIT 1`, [data.userId, data.roomId]);
        if (existingBookings.length > 0) {
            const lastBooking = existingBookings[0];
            if (lastBooking.status === "pending" || lastBooking.status === "confirmed") {
                return res.status(400).json({
                    message: "Booking already exists with pending or confirmed status."
                });
            }
            if (lastBooking.status === "cancelled") {
                yield db_1.pool.query("DELETE FROM bookings WHERE id = ?", [lastBooking.id]);
            }
        }
        // ✅ Insert new booking
        const [result] = yield db_1.pool.query(`INSERT INTO bookings 
       (userId, roomId, checkInDate, checkOutDate, paymentStatus, people, payment, status, remark, transactionId, pidx, isActiveStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            data.userId,
            data.roomId,
            data.checkInDate,
            checkOutDate,
            data.paymentStatus || "Pending",
            data.people,
            data.payment || 0,
            data.status || "pending",
            data.remark || null,
            data.transactionId || null,
            data.pidx || null,
            data.isActiveStatus || false,
        ]);
        const bookingId = result.insertId;
        // 🔍 Fetch user and room details
        const [userRows] = yield db_1.pool.query("SELECT userName, email, contact, address FROM users WHERE id = ?", [data.userId]);
        const [roomRows] = yield db_1.pool.query("SELECT hostelName, location, peopleNumber, price, imgUrls, ownerEmail, ownerId FROM rooms WHERE id = ?", [data.roomId]);
        if (userRows.length === 0)
            return res.status(404).json({ message: "User not found" });
        if (roomRows.length === 0)
            return res.status(404).json({ message: "Room not found" });
        const user = userRows[0];
        const room = roomRows[0];
        // ✅ Parse imgUrls safely
        let roomImages = [];
        try {
            roomImages = Array.isArray(room.imgUrls) ? room.imgUrls : JSON.parse(room.imgUrls);
        }
        catch (e) {
            roomImages = [];
        }
        // 📧 Send email notification (first image as thumbnail)
        const body = (0, utils_1.BookingNotification)(room.ownerEmail, user.userName, roomImages[0] || "", user.email, user.contact, user.address, data.people, room.hostelName, room.location, room.peopleNumber, room.price);
        yield (0, utils_1.sendMail)(room.ownerEmail, "Booking Reservation", body);
        // 🔔 Send real-time socket notification
        const notification = `Following user with name: ${user.userName} has sent a booking notification to ${room.hostelName}`;
        const ownerSocketId = (0, RealTime_1.getUserSocketId)(room.ownerId);
        if (ownerSocketId) {
            RealTime_1.io.to(ownerSocketId).emit("push-notification", {
                message: notification,
                bookingId,
                roomImages, // send all images for slider
            });
        }
        res.status(201).json({
            message: "Booking created successfully",
            bookingId,
            roomImages, // include all images in response for frontend slider
        });
    }
    catch (err) {
        next(err);
    }
});
exports.createBooking = createBooking;
// export const updateBooking = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { id } = req.params;
//     // Handle the specific format {body: {isActiveStatus: 0}}
//     const requestBody = req.body.body || req.body;
//     const data = requestBody.data || requestBody;
//     // Check if only isActiveStatus field is being updated
//     const isStatusOnlyUpdate = 
//       (data.isActiveStatus !== undefined) && 
//       (data.userId === undefined && 
//        data.roomId === undefined && 
//        data.checkInDate === undefined && 
//        data.checkOutDate === undefined && 
//        data.paymentStatus === undefined && 
//        data.people === undefined && 
//        data.payment === undefined && 
//        data.status === undefined);
//     let query: string;
//     let params: any[];
//     if (isStatusOnlyUpdate) {
//       // Only update the isActiveStatus field
//       query = `UPDATE bookings SET isActiveStatus = ? WHERE id = ?`;
//       params = [data.isActiveStatus, id];
//     } else {
//       // Update all fields as before
//       query = `
//         UPDATE bookings 
//         SET userId = COALESCE(?, userId),
//             roomId = COALESCE(?, roomId),
//             checkInDate = COALESCE(?, checkInDate),
//             checkOutDate = COALESCE(?, checkOutDate),
//             paymentStatus = COALESCE(?, paymentStatus),
//             people = COALESCE(?, people),
//             payment = COALESCE(?, payment),
//             status = COALESCE(?, status),
//             isActiveStatus = COALESCE(?, isActiveStatus)
//         WHERE id = ?
//       `;
//       params = [
//         data.userId ?? null,
//         data.roomId ?? null,
//         data.checkInDate ?? null,
//         data.checkOutDate ?? null,
//         data.paymentStatus ?? null,
//         data.people ?? null,
//         data.payment ?? null,
//         data.status ?? null,
//         data.isActiveStatus ?? null,
//         id
//       ];
//     }
//     const [result] = await pool.query<ResultSetHeader>(query, params);
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Booking not found" });
//     }
//     res.json({ message: "Booking updated successfully" });
//   } catch (err) {
//     next(err);
//   }
// };
// ----------------- Get All Bookings -----------------
const updateBooking = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    try {
        const { id } = req.params;
        // Handle the specific format {body: {isActiveStatus: 0}}
        const requestBody = req.body.body || req.body;
        const data = requestBody.data || requestBody;
        // Check if only isActiveStatus field is being updated
        const isStatusOnlyUpdate = (data.isActiveStatus !== undefined) &&
            (data.userId === undefined &&
                data.roomId === undefined &&
                data.checkInDate === undefined &&
                data.checkOutDate === undefined &&
                data.paymentStatus === undefined &&
                data.people === undefined &&
                data.payment === undefined &&
                data.status === undefined);
        let query;
        let params;
        if (isStatusOnlyUpdate) {
            // Only update the isActiveStatus field
            query = `UPDATE bookings SET isActiveStatus = ? WHERE id = ?`;
            params = [data.isActiveStatus, id];
        }
        else {
            // Update all fields as before
            query = `
        UPDATE bookings 
        SET userId = COALESCE(?, userId),
            roomId = COALESCE(?, roomId),
            checkInDate = COALESCE(?, checkInDate),
            checkOutDate = COALESCE(?, checkOutDate),
            paymentStatus = COALESCE(?, paymentStatus),
            people = COALESCE(?, people),
            payment = COALESCE(?, payment),
            status = COALESCE(?, status),
            isActiveStatus = COALESCE(?, isActiveStatus)
        WHERE id = ?
      `;
            params = [
                (_a = data.userId) !== null && _a !== void 0 ? _a : null,
                (_b = data.roomId) !== null && _b !== void 0 ? _b : null,
                (_c = data.checkInDate) !== null && _c !== void 0 ? _c : null,
                (_d = data.checkOutDate) !== null && _d !== void 0 ? _d : null,
                (_e = data.paymentStatus) !== null && _e !== void 0 ? _e : null,
                (_f = data.people) !== null && _f !== void 0 ? _f : null,
                (_g = data.payment) !== null && _g !== void 0 ? _g : null,
                (_h = data.status) !== null && _h !== void 0 ? _h : null,
                (_j = data.isActiveStatus) !== null && _j !== void 0 ? _j : null,
                id
            ];
        }
        const [result] = yield db_1.pool.query(query, params);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }
        // Check if status was updated to "confirmed" and send email to tenant
        if (data.status === "confirmed") {
            try {
                // Get booking details with user and room information
                const [bookingDetails] = yield db_1.pool.query(`
          SELECT 
            b.*,
            u.userName, 
            u.email as tenantEmail,
            r.hostelName,
            r.location,
            r.price,
            r.ownerEmail
          FROM bookings b
          JOIN users u ON b.userId = u.id
          JOIN rooms r ON b.roomId = r.id
          WHERE b.id = ?
        `, [id]);
                if (bookingDetails.length > 0) {
                    const booking = bookingDetails[0];
                    // Create email content for tenant
                    const tenantEmailContent = `
            <h2>Booking Confirmed!</h2>
            <p>Dear ${booking.userName},</p>
            <p>Your booking for ${booking.hostelName} has been confirmed by the owner.</p>
            <p><strong>Booking Details:</strong></p>
            <ul>
              <li>Hostel: ${booking.hostelName}</li>
              <li>Location: ${booking.location}</li>
              <li>Check-in Date: ${new Date(booking.checkInDate).toLocaleDateString()}</li>
              ${booking.checkOutDate ? `<li>Check-out Date: ${new Date(booking.checkOutDate).toLocaleDateString()}</li>` : ''}
              <li>Number of People: ${booking.people}</li>
              <li>Total Price: Rs.${booking.price}</li>
            </ul>
            <p><strong>Please make your payment to complete the booking process.</strong></p>
            <p>Thank you for choosing our service!</p>
          `;
                    // Send email to tenant
                    yield (0, utils_1.sendMail)(booking.tenantEmail, "Booking Confirmed", tenantEmailContent);
                    // console.log(`Confirmation email sent to tenant: ${booking.tenantEmail}`);
                }
            }
            catch (emailError) {
                console.error("Failed to send confirmation email to tenant:", emailError);
                // Don't fail the whole request if email fails
            }
        }
        res.json({ message: "Booking updated successfully" });
    }
    catch (err) {
        next(err);
    }
});
exports.updateBooking = updateBooking;
const getAllBooking = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { page = 1, limit = 10, status = "", search = "", isActiveStatus = "" } = req.query;
        page = Number(page);
        limit = Number(limit);
        const offset = (page - 1) * limit;
        // Base query
        let whereClauses = [];
        let values = [];
        if (status) {
            whereClauses.push("b.status = ?");
            values.push(status);
        }
        if (isActiveStatus) {
            whereClauses.push("b.isActiveStatus = ?");
            values.push(isActiveStatus);
        }
        if (search) {
            whereClauses.push("(u.userName LIKE ? OR u.email LIKE ? OR r.hostelName LIKE ?)");
            values.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        const whereSQL = whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : "";
        // Count total bookings for pagination
        const [countRows] = yield db_1.pool.query(`SELECT COUNT(*) as total FROM bookings b
       JOIN users u ON b.userId = u.id
       JOIN rooms r ON b.roomId = r.id
       ${whereSQL}`, values);
        const total = countRows[0].total;
        const totalPages = Math.ceil(total / limit);
        // Main query with pagination
        const [rows] = yield db_1.pool.query(`SELECT 
         b.id AS bookingId,
         b.checkInDate,
         b.checkOutDate,
         b.paymentStatus,
         b.people,
         b.payment,
         b.isActiveStatus,
         b.status,
         b.createdAt AS bookingCreatedAt,
         b.updatedAt AS bookingUpdatedAt,
         u.id AS userId,
         u.userName,
         u.email AS userEmail,
         u.contact AS userContact,
         u.address AS userAddress,
         r.id AS roomId,
         r.hostelName,
         r.location,
         r.price,
         r.contact,
         r.imgUrls,
         r.ownerEmail,
         r.createdAt AS roomCreatedAt,
         r.updatedAt AS roomUpdatedAt
       FROM bookings b
       JOIN users u ON b.userId = u.id
       JOIN rooms r ON b.roomId = r.id
       ${whereSQL}
       ORDER BY b.createdAt DESC
       LIMIT ? OFFSET ?`, [...values, limit, offset]);
        // Transform rows into nested objects
        const bookings = rows.map(row => ({
            id: row.bookingId,
            checkInDate: row.checkInDate,
            checkOutDate: row.checkOutDate,
            paymentStatus: row.paymentStatus,
            people: row.people,
            payment: row.payment,
            isActiveStatus: row.isActiveStatus,
            status: row.status,
            createdAt: row.bookingCreatedAt,
            updatedAt: row.bookingUpdatedAt,
            user: {
                id: row.userId,
                userName: row.userName,
                email: row.userEmail,
                contact: row.userContact,
                address: row.userAddress,
            },
            room: {
                id: row.roomId,
                hostelName: row.hostelName,
                location: row.location,
                price: row.price,
                contact: row.contact,
                // ✅ Parse imgUrls safely
                imgUrls: (() => {
                    try {
                        return Array.isArray(row.imgUrls) ? row.imgUrls : JSON.parse(row.imgUrls);
                    }
                    catch (_a) {
                        return [];
                    }
                })(),
                ownerEmail: row.ownerEmail,
                createdAt: row.roomCreatedAt,
                updatedAt: row.roomUpdatedAt,
            },
        }));
        res.json({
            data: bookings,
            pagination: {
                total,
                page,
                limit,
                pages: totalPages,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllBooking = getAllBooking;
// ----------------- Get Bookings by Room ID -----------------
// ----------------- Get Bookings by Room ID -----------------
const getBookingByRoomId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const [rows] = yield db_1.pool.query(`SELECT b.*, 
              u.userName, u.email, u.contact, 
              r.hostelName, r.location 
       FROM bookings b
       JOIN users u ON b.userId = u.id
       JOIN rooms r ON b.roomId = r.id
       WHERE b.roomId = ?`, [id]);
        if (rows.length === 0)
            return CusomError_1.default.searchEntityMissingError(next);
        return (0, const_1.DataFoundMessage)(res, rows);
    }
    catch (err) {
        next(err);
    }
});
exports.getBookingByRoomId = getBookingByRoomId;
// ----------------- Get Bookings by User ID -----------------
const getBookingByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const [rows] = yield db_1.pool.query(`SELECT b.*, 
              u.userName, u.email, u.contact, 
              r.hostelName, r.location 
       FROM bookings b
       JOIN users u ON b.userId = u.id
       JOIN rooms r ON b.roomId = r.id
       WHERE b.userId = ?`, [id]);
        if (rows.length === 0)
            return CusomError_1.default.searchEntityMissingError(next);
        return (0, const_1.DataFoundMessage)(res, rows);
    }
    catch (err) {
        next(err);
    }
});
exports.getBookingByUserId = getBookingByUserId;
// ----------------- Delete Booking -----------------
const deleteBooking = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const [result] = yield db_1.pool.query("DELETE FROM bookings WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.json({ message: "Booking deleted successfully" });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteBooking = deleteBooking;
