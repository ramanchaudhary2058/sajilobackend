"use strict";
// import { Request, Response } from "express";
// import dotenv from "dotenv";
// import { pool } from "../db";
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
exports.verifyPayment = exports.initiatePayment = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("../db");
const RealTime_1 = require("../real-time/RealTime");
const utils_1 = require("../utils");
dotenv_1.default.config();
// Initiate payment
const initiatePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const amount = parseInt(req.params.amount, 10);
    if (isNaN(amount) || amount <= 0)
        return res.status(400).json({ error: "Invalid amount" });
    const mode = process.env.MODE;
    const website_url = mode === "development" ? "http://localhost:5173" : "https://city-hostel-zeta.vercel.app";
    const return_url = mode === "development" ? "http://localhost:5173/payment-success" : "https://city-hostel-zeta.vercel.app/payment-success";
    const amountInPaisa = amount * 100;
    const data = JSON.stringify({
        return_url,
        website_url,
        amount: amountInPaisa,
        purchase_order_id: `order-${Date.now()}`,
        purchase_order_name: "Sajilo Aawas Booking",
        customer_info: {
            name: "Sajilo Aawas",
            email: "ramancdry2058@gmail.com",
            phone: "9865809181",
        },
        amount_breakdown: [{ label: "Total Price", amount: amountInPaisa }],
    });
    try {
        const response = yield fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
            },
            body: data,
        });
        const result = yield response.json();
        if (result.payment_url)
            return res.json({ url: result.payment_url });
        return res.status(400).json({ error: "Failed to initiate payment", details: result });
    }
    catch (err) {
        console.error("Server error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});
exports.initiatePayment = initiatePayment;
const verifyPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pidx, bookingId } = req.body;
    if (!pidx || !bookingId) {
        return res.status(400).json({ success: false, message: "Missing payment information" });
    }
    try {
        const response = yield fetch("https://a.khalti.com/api/v2/epayment/lookup/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`
            },
            body: JSON.stringify({ pidx }),
        });
        if (!response.ok) {
            throw new Error(`Khalti API responded with status: ${response.status}`);
        }
        const result = yield response.json();
        switch (result.status) {
            case "Completed":
                // ✅ Update booking
                yield updateBooking(bookingId, {
                    paymentStatus: "FullPayment",
                    payment: result.total_amount / 100,
                    status: "confirmed",
                    transactionId: result.transaction_id,
                    pidx: result.pidx,
                    isActiveStatus: true, // activate booking
                });
                // ✅ Fetch booking details with user and room information
                const [rows] = yield db_1.pool.query(`
          SELECT 
            b.id AS bookingId, 
            b.payment,
            b.checkInDate,
            b.checkOutDate,
            b.people,
            r.hostelName, 
            r.location,
            r.price,
            r.ownerId,
            r.ownerEmail,
            u.id as tenantId,
            u.userName as tenantName,
            u.email as tenantEmail
          FROM bookings b
          JOIN rooms r ON b.roomId = r.id
          JOIN users u ON b.userId = u.id
          WHERE b.id = ?
        `, [bookingId]);
                if (rows.length > 0) {
                    const booking = rows[0];
                    // Create a single email that will be sent to both tenant and owner
                    const combinedEmailContent = `
            <h2>Payment Confirmed!</h2>
            <p>Dear ${booking.tenantName} and Hostel Owner,</p>
            <p>The payment for ${booking.hostelName} has been successfully processed.</p>
            
            <p><strong>Payment Details:</strong></p>
            <ul>
              <li>Amount Paid: Rs.${booking.payment}</li>
              <li>Transaction ID: ${result.transaction_id}</li>
              <li>Payment Date: ${new Date().toLocaleDateString()}</li>
            </ul>
            
            <p><strong>Booking Details:</strong></p>
            <ul>
              <li>Hostel: ${booking.hostelName}</li>
              <li>Location: ${booking.location}</li>
              <li>Check-in Date: ${new Date(booking.checkInDate).toLocaleDateString()}</li>
              ${booking.checkOutDate ? `<li>Check-out Date: ${new Date(booking.checkOutDate).toLocaleDateString()}</li>` : ''}
              <li>Number of People: ${booking.people}</li>
            </ul>
            
            <p><strong>Tenant Information:</strong></p>
            <ul>
              <li>Name: ${booking.tenantName}</li>
              <li>Email: ${booking.tenantEmail}</li>
            </ul>
            
            <p>Thank you for your payment! The booking is now confirmed.</p>
          `;
                    try {
                        // Send single email to both tenant and owner
                        yield (0, utils_1.sendMail)([booking.tenantEmail, booking.ownerEmail], // Send to both addresses
                        "Payment Confirmed for Booking", combinedEmailContent);
                        console.log(`Payment confirmation email sent to both tenant (${booking.tenantEmail}) and owner (${booking.ownerEmail})`);
                    }
                    catch (emailError) {
                        console.error("Failed to send payment confirmation email:", emailError);
                        // Don't fail the whole request if email fails
                    }
                    // Send real-time notification to owner
                    const [ownerRows] = yield db_1.pool.query("SELECT id, userName FROM users WHERE id = ?", [booking.ownerId]);
                    if (ownerRows.length > 0) {
                        const owner = ownerRows[0];
                        const ownerSocketId = (0, RealTime_1.getUserSocketId)(owner.id);
                        if (ownerSocketId) {
                            RealTime_1.io.to(ownerSocketId).emit("push-notification", {
                                message: `💰 ${booking.tenantName} just paid Rs.${booking.payment} for ${booking.hostelName}. Booking confirmed.`,
                                bookingId,
                                amount: booking.payment,
                                transactionId: result.transaction_id,
                            });
                        }
                    }
                }
                return res.json({
                    success: true,
                    status: "Completed",
                    amount: result.total_amount / 100,
                    transactionId: result.transaction_id
                });
            case "Pending":
            case "Initiated":
                yield updateBooking(bookingId, {
                    paymentStatus: "Pending",
                    status: "pending",
                    isActiveStatus: false,
                });
                return res.json({
                    success: false,
                    status: result.status,
                    message: "Payment is being processed"
                });
            case "Failed":
            case "Cancelled":
            case "Expired":
                yield updateBooking(bookingId, {
                    paymentStatus: "Pending",
                    status: "pending",
                    isActiveStatus: false,
                });
                return res.status(400).json({
                    success: false,
                    status: result.status,
                    message: "Payment failed, cancelled, or expired"
                });
            default:
                return res.status(400).json({
                    success: false,
                    status: result.status,
                    message: result.message || "Payment not completed"
                });
        }
    }
    catch (err) {
        console.error("Verification error:", err);
        return res.status(500).json({ success: false, message: "Payment verification failed. Try again later." });
    }
});
exports.verifyPayment = verifyPayment;
// export const verifyPayment = async (req: Request, res: Response) => {
//   const { pidx, bookingId } = req.body;
//   if (!pidx || !bookingId) {
//     return res.status(400).json({ success: false, message: "Missing payment information" });
//   }
//   try {
//     const response = await fetch("https://a.khalti.com/api/v2/epayment/lookup/", {
//       method: "POST",
//       headers: { 
//         "Content-Type": "application/json", 
//         Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` 
//       },
//       body: JSON.stringify({ pidx }),
//     });
//     if (!response.ok) {
//       throw new Error(`Khalti API responded with status: ${response.status}`);
//     }
//     const result = await response.json();
//     switch (result.status) {
//       case "Completed":
//         // ✅ Update booking
//         await updateBooking(bookingId, { 
//           paymentStatus: "FullPayment",
//           payment: result.total_amount / 100,
//           status: "confirmed",
//           transactionId: result.transaction_id,
//           pidx: result.pidx,
//           isActiveStatus: true, // activate booking
//         });
//         // ✅ Fetch booking details with user and room information
//         const [rows] = await pool.query<RowDataPacket[]>(`
//           SELECT 
//             b.id AS bookingId, 
//             b.payment,
//             b.checkInDate,
//             b.checkOutDate,
//             b.people,
//             r.hostelName, 
//             r.location,
//             r.price,
//             r.ownerId,
//             r.ownerEmail,
//             u.id as tenantId,
//             u.userName as tenantName,
//             u.email as tenantEmail
//           FROM bookings b
//           JOIN rooms r ON b.roomId = r.id
//           JOIN users u ON b.userId = u.id
//           WHERE b.id = ?
//         `, [bookingId]);
//         if (rows.length > 0) {
//           const booking = rows[0];
//           // Send email to tenant
//           const tenantEmailContent = `
//             <h2>Payment Confirmed!</h2>
//             <p>Dear ${booking.tenantName},</p>
//             <p>Your payment for ${booking.hostelName} has been successfully processed.</p>
//             <p><strong>Payment Details:</strong></p>
//             <ul>
//               <li>Amount Paid: Rs.${booking.payment}</li>
//               <li>Transaction ID: ${result.transaction_id}</li>
//               <li>Payment Date: ${new Date().toLocaleDateString()}</li>
//             </ul>
//             <p><strong>Booking Details:</strong></p>
//             <ul>
//               <li>Hostel: ${booking.hostelName}</li>
//               <li>Location: ${booking.location}</li>
//               <li>Check-in Date: ${new Date(booking.checkInDate).toLocaleDateString()}</li>
//               ${booking.checkOutDate ? `<li>Check-out Date: ${new Date(booking.checkOutDate).toLocaleDateString()}</li>` : ''}
//               <li>Number of People: ${booking.people}</li>
//             </ul>
//             <p>Thank you for your payment! Your booking is now confirmed.</p>
//           `;
//           // Send email to owner
//           const ownerEmailContent = `
//             <h2>Payment Received!</h2>
//             <p>Dear Hostel Owner,</p>
//             <p>You have received a payment of Rs.${booking.payment} for ${booking.hostelName}.</p>
//             <p><strong>Payment Details:</strong></p>
//             <ul>
//               <li>Amount: Rs.${booking.payment}</li>
//               <li>Transaction ID: ${result.transaction_id}</li>
//               <li>Payment Date: ${new Date().toLocaleDateString()}</li>
//             </ul>
//             <p><strong>Tenant Details:</strong></p>
//             <ul>
//               <li>Name: ${booking.tenantName}</li>
//               <li>Email: ${booking.tenantEmail}</li>
//             </ul>
//             <p><strong>Booking Details:</strong></p>
//             <ul>
//               <li>Check-in Date: ${new Date(booking.checkInDate).toLocaleDateString()}</li>
//               ${booking.checkOutDate ? `<li>Check-out Date: ${new Date(booking.checkOutDate).toLocaleDateString()}</li>` : ''}
//               <li>Number of People: ${booking.people}</li>
//             </ul>
//           `;
//           try {
//             // Send email to tenant
//             await sendMail(booking.tenantEmail, "Payment Confirmed", tenantEmailContent);
//             console.log(`Payment confirmation email sent to tenant: ${booking.tenantEmail}`);
//             // Send email to owner
//             await sendMail(booking.ownerEmail, "Payment Received", ownerEmailContent);
//             console.log(`Payment notification email sent to owner: ${booking.ownerEmail}`);
//           } catch (emailError) {
//             console.error("Failed to send payment confirmation emails:", emailError);
//             // Don't fail the whole request if email fails
//           }
//           // Send real-time notification to owner
//           const [ownerRows] = await pool.query<RowDataPacket[]>(
//             "SELECT id, userName FROM users WHERE id = ?",
//             [booking.ownerId]
//           );
//           if (ownerRows.length > 0) {
//             const owner = ownerRows[0];
//             const ownerSocketId = getUserSocketId(owner.id);
//             if (ownerSocketId) {
//               io.to(ownerSocketId).emit("push-notification", {
//                 message: `💰 ${booking.tenantName} just paid $${booking.payment} for ${booking.hostelName}. Booking confirmed.`,
//                 bookingId,
//                 amount: booking.payment,
//                 transactionId: result.transaction_id,
//               });
//             }
//           }
//         }
//         return res.json({ 
//           success: true, 
//           status: "Completed", 
//           amount: result.total_amount / 100, 
//           transactionId: result.transaction_id 
//         });
//       case "Pending":
//       case "Initiated":
//         await updateBooking(bookingId, { 
//           paymentStatus: "Pending", 
//           status: "pending",
//           isActiveStatus: false,
//         });
//         return res.json({ 
//           success: false, 
//           status: result.status, 
//           message: "Payment is being processed" 
//         });
//       case "Failed":
//       case "Cancelled":
//       case "Expired":
//         await updateBooking(bookingId, { 
//           paymentStatus: "Pending", 
//           status: "pending",
//           isActiveStatus: false,
//         });
//         return res.status(400).json({ 
//           success: false, 
//           status: result.status, 
//           message: "Payment failed, cancelled, or expired" 
//         });
//       default:
//         return res.status(400).json({ 
//           success: false, 
//           status: result.status, 
//           message: result.message || "Payment not completed" 
//         });
//     }
//   } catch (err) {
//     console.error("Verification error:", err);
//     return res.status(500).json({ success: false, message: "Payment verification failed. Try again later." });
//   }
// };
// Update booking helper
function updateBooking(bookingId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const fields = [];
        const values = [];
        for (const key in data) {
            fields.push(`${key} = ?`);
            values.push(data[key]);
        }
        values.push(bookingId);
        const query = `UPDATE bookings SET ${fields.join(", ")} WHERE id = ?`;
        yield db_1.pool.query(query, values);
    });
}
