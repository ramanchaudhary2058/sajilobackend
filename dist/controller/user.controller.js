"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserAccount = exports.getUserById = exports.getAllUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../db");
// ----------------- Get All Users -----------------
const getAllUser = async (req, res, next) => {
    try {
        let { page = 1, limit = 10, role = "", search = "" } = req.query;
        page = Number(page);
        limit = Number(limit);
        const offset = (page - 1) * limit;
        // Build WHERE clauses
        const whereClauses = [];
        const values = [];
        if (role) {
            whereClauses.push("role = ?");
            values.push(role);
        }
        if (search) {
            whereClauses.push("(userName LIKE ? OR email LIKE ? OR contact LIKE ?)");
            values.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        const whereSQL = whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : "";
        // Count total users for pagination
        const [countRows] = await db_1.pool.query(`SELECT COUNT(*) as total FROM users ${whereSQL}`, values);
        const total = countRows[0].total;
        const totalPages = Math.ceil(total / limit);
        // Main query with pagination (added isVerify ✅)
        const [rows] = await db_1.pool.query(`SELECT id, userName, email, contact, address, role, isVerify, createdAt, updatedAt 
       FROM users
       ${whereSQL}
       ORDER BY createdAt DESC
       LIMIT ? OFFSET ?`, [...values, limit, offset]);
        res.json({
            data: rows,
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
};
exports.getAllUser = getAllUser;
// ----------------- Get User By ID -----------------
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await db_1.pool.query("SELECT id, userName, email, contact, address, role FROM users WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(rows[0]);
    }
    catch (err) {
        next(err);
    }
};
exports.getUserById = getUserById;
// ----------------- Update User -----------------
// export const updateUserAccount = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { id } = req.params;
//     // FIX: access nested `data`
//     const data = req.body.data || req.body;
//     let hashedPwd: string | null = null;
//     if (data.password) {
//       hashedPwd = await bcrypt.hash(data.password, 10);
//     }
//     const query = `
//       UPDATE users
//       SET 
//         userName = COALESCE(?, userName),
//         email = COALESCE(?, email),
//         contact = COALESCE(?, contact),
//         address = COALESCE(?, address),
//         role = COALESCE(?, role),
//         password = COALESCE(?, password)
//       WHERE id = ?
//     `;
//     const [result] = await pool.query<ResultSetHeader>(query, [
//       data.userName ?? null,
//       data.email ?? null,
//       data.contact ?? null,
//       data.address ?? null,
//       data.role ?? null,
//       hashedPwd,
//       id,
//     ]);
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.json({ message: "User updated successfully" });
//   } catch (err) {
//     next(err);
//   }
// };
const updateUserAccount = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Handle the specific format {body: {isVerify: 0}}
        const requestBody = req.body.body || req.body;
        const data = requestBody.data || requestBody;
        let hashedPwd = null;
        if (data.password) {
            hashedPwd = await bcrypt_1.default.hash(data.password, 10);
        }
        // Check if only status fields are being updated
        const isStatusOnlyUpdate = (data.isVerify !== undefined) &&
            (data.userName === undefined &&
                data.email === undefined &&
                data.contact === undefined &&
                data.address === undefined &&
                data.role === undefined &&
                data.password === undefined);
        let query;
        let params;
        if (isStatusOnlyUpdate) {
            // Only update the isVerify field
            query = `UPDATE users SET isVerify = ? WHERE id = ?`;
            params = [data.isVerify, id];
        }
        else {
            // Update all fields as before
            query = `
        UPDATE users
        SET 
          userName = COALESCE(?, userName),
          email = COALESCE(?, email),
          contact = COALESCE(?, contact),
          address = COALESCE(?, address),
          role = COALESCE(?, role),
          password = COALESCE(?, password),
          isVerify = COALESCE(?, isVerify)
        WHERE id = ?
      `;
            params = [
                data.userName ?? null,
                data.email ?? null,
                data.contact ?? null,
                data.address ?? null,
                data.role ?? null,
                hashedPwd,
                data.isVerify ?? null,
                id,
            ];
        }
        const [result] = await db_1.pool.query(query, params);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User updated successfully" });
    }
    catch (err) {
        next(err);
    }
};
exports.updateUserAccount = updateUserAccount;
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log("Deleting user with ID:", id); // 👈 log incoming id
        const [result] = await db_1.pool.query("DELETE FROM users WHERE id = ?", [id]);
        console.log("Delete Result:", result); // 👈 check MySQL response
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    }
    catch (err) {
        console.error("Delete Error:", err); // 👈 show full error
        next(err);
    }
};
exports.deleteUser = deleteUser;
