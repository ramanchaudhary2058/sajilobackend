
import { Request, Response, NextFunction } from "express";
import { pool } from "../db";
import axios from "axios";
import dotenv from "dotenv";
import { RowDataPacket, ResultSetHeader } from "mysql2";

dotenv.config();



export const createRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recaptchaToken = req.body.recaptchaToken;

    // Verify reCAPTCHA
    const verificationResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.GOOGLE_SECRET_KEY_CAPTCHA,
          response: recaptchaToken,
        },
      }
    );

    const { success, score } = verificationResponse.data;

    if (!success || (score && score < 0.5)) {
      return res.status(400).json({ message: "Failed reCAPTCHA verification" });
    }

    const {
      title,
      hostelName,
      imgUrls, // Now expecting array of URLs
      location,
      price,
      frequency,
      peopleNumber,
      totalBed,
      email,
      contact,
      ownerEmail,
      ownerId,
    } = req.body;

    // Convert array to JSON string for database storage
    const imgUrlsJson = JSON.stringify(imgUrls);

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO rooms 
       (title, hostelName, imgUrls, location, price, frequency, peopleNumber, totalBed, email, contact, ownerEmail, ownerId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, hostelName, imgUrlsJson, location, price, frequency, peopleNumber, totalBed, email, contact, ownerEmail, ownerId]
    );

    res.status(201).json({ 
      message: "Room created successfully", 
      roomId: result.insertId 
    });
  } catch (err) {
    next(err);
  }
};
export const getAllRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { page = 1, limit = 5, search = "", price, location } = req.query;

    page = Number(page);
    limit = Number(limit);
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const values: any[] = [];

    // Price filter
    if (price && !Array.isArray(price) && Number(price) > 0) {
      whereClauses.push("price <= ?");
      values.push(Number(price));
    }

    // Location filter
    if (location && typeof location === "string" && location.trim() !== "") {
      whereClauses.push("location LIKE ?");
      values.push(`%${location}%`);
    }

    // Search
    if (search && typeof search === "string" && search.trim() !== "") {
      whereClauses.push("(hostelName LIKE ? OR location LIKE ? OR ownerEmail LIKE ?)");
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereSQL = whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : "";

    // Total count
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM rooms ${whereSQL}`,
      values
    );
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    // Paginated rows
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM rooms ${whereSQL} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    res.json({
      data: rows,
      pagination: {
        total,
        page,
        limit,
        pages: totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
};




// ----------------- Get Room By ID -----------------




export const getRoomById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM rooms WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    const room = rows[0];

    // ✅ Parse imgUrls
    room.imgUrls = room.imgUrls ? JSON.parse(room.imgUrls) : [];

    res.json(room);
  } catch (err) {
    console.error('Error fetching room:', err);
    next(err);
  }
};



// export const updateRoom = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { id } = req.params;
//     const data = req.body.data || req.body;

//     if (!id || isNaN(Number(id))) {
//       return res.status(400).json({ message: "Invalid room ID" });
//     }

//     // Convert array of images to JSON string for DB
//     const imgUrlsJson = Array.isArray(data.imgUrls)
//       ? JSON.stringify(data.imgUrls)
//       : data.imgUrls
//       ? JSON.stringify([data.imgUrls])
//       : "[]";

//     const requiredFields = [
//       "title",
//       "hostelName",
//       "location",
//       "price",
//       "frequency",
//       "peopleNumber",
//       "totalBed",
//       "email",
//       "contact",
//       "ownerEmail",
//     ];

//     const missingFields = requiredFields.filter((field) => !data[field]);
//     if (missingFields.length > 0) {
//       return res.status(400).json({ message: "Missing required fields", missingFields });
//     }

//     // Validate numeric fields
//     if (isNaN(Number(data.peopleNumber)) || isNaN(Number(data.totalBed))) {
//       return res.status(400).json({ message: "People number and total bed must be numbers" });
//     }

//     // Check room exists
//     const [checkRows] = await pool.query<RowDataPacket[]>(
//       "SELECT id FROM rooms WHERE id = ?",
//       [id]
//     );
//     if (checkRows.length === 0) {
//       return res.status(404).json({ message: "Room not found" });
//     }

//     // Update room
//     const query = `
//       UPDATE rooms 
//       SET 
//         title = ?, 
//         hostelName = ?, 
//         imgUrls = ?, 
//         location = ?, 
//         price = ?, 
//         frequency = ?, 
//         peopleNumber = ?, 
//         totalBed = ?, 
//         email = ?, 
//         contact = ?, 
//         ownerEmail = ?,
//         updatedAt = CURRENT_TIMESTAMP
//       WHERE id = ?
//     `;

//     const [result] = await pool.query<ResultSetHeader>(query, [
//       data.title,
//       data.hostelName,
//       imgUrlsJson,          // <-- Use JSON array
//       data.location,
//       data.price,
//       data.frequency,
//       Number(data.peopleNumber),
//       Number(data.totalBed),
//       data.email,
//       data.contact,
//       data.ownerEmail,
//       id,
//     ]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Room not found or no changes made" });
//     }

//     const [updatedRows] = await pool.query<RowDataPacket[]>(
//       "SELECT * FROM rooms WHERE id = ?",
//       [id]
//     );

//     res.json({
//       message: "Room updated successfully",
//       room: updatedRows[0],
//     });
//   } catch (err) {
//     console.error("Error updating room:", err);
//     next(err);
//   }
// };



export const updateRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Handle the specific format {body: {isAvailable: 0}}
    const requestBody = req.body.body || req.body;
    const data = requestBody.data || requestBody;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    // Check if only isAvailable field is being updated
    const isStatusOnlyUpdate = 
      (data.isAvailable !== undefined) && 
      (data.title === undefined && 
       data.hostelName === undefined && 
       data.location === undefined && 
       data.price === undefined && 
       data.frequency === undefined && 
       data.peopleNumber === undefined && 
       data.totalBed === undefined && 
       data.email === undefined && 
       data.contact === undefined && 
       data.ownerEmail === undefined &&
       data.imgUrls === undefined);

    let query: string;
    let params: any[];

    if (isStatusOnlyUpdate) {
      // Only update the isAvailable field
      query = `UPDATE rooms SET isAvailable = ? WHERE id = ?`;
      params = [data.isAvailable, id];
    } else {
      // Convert array of images to JSON string for DB
      const imgUrlsJson = Array.isArray(data.imgUrls)
        ? JSON.stringify(data.imgUrls)
        : data.imgUrls
        ? JSON.stringify([data.imgUrls])
        : "[]";

      const requiredFields = [
        "title",
        "hostelName",
        "location",
        "price",
        "frequency",
        "peopleNumber",
        "totalBed",
        "email",
        "contact",
        "ownerEmail",
      ];

      const missingFields = requiredFields.filter((field) => !data[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({ message: "Missing required fields", missingFields });
      }

      // Validate numeric fields
      if (isNaN(Number(data.peopleNumber)) || isNaN(Number(data.totalBed))) {
        return res.status(400).json({ message: "People number and total bed must be numbers" });
      }

      // Update all fields as before
      query = `
        UPDATE rooms 
        SET 
          title = ?, 
          hostelName = ?, 
          imgUrls = ?, 
          location = ?, 
          price = ?, 
          frequency = ?, 
          peopleNumber = ?, 
          totalBed = ?, 
          email = ?, 
          contact = ?, 
          ownerEmail = ?,
          isAvailable = COALESCE(?, isAvailable),
          updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      params = [
        data.title,
        data.hostelName,
        imgUrlsJson,
        data.location,
        data.price,
        data.frequency,
        Number(data.peopleNumber),
        Number(data.totalBed),
        data.email,
        data.contact,
        data.ownerEmail,
        data.isAvailable ?? null,
        id,
      ];
    }

    // Check room exists
    const [checkRows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM rooms WHERE id = ?",
      [id]
    );
    if (checkRows.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    const [result] = await pool.query<ResultSetHeader>(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Room not found or no changes made" });
    }

    const [updatedRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM rooms WHERE id = ?",
      [id]
    );

    res.json({
      message: "Room updated successfully",
      room: updatedRows[0],
    });
  } catch (err) {
    console.error("Error updating room:", err);
    next(err);
  }
};
// ----------------- Delete Room -----------------
export const deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query<ResultSetHeader>("DELETE FROM rooms WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    next(err);
  }
};
