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
exports.deleteUser = exports.updateUserAccount = exports.getUserById = exports.getAllUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../db");
// ----------------- Get All Users -----------------
const getAllUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const [countRows] = yield db_1.pool.query(`SELECT COUNT(*) as total FROM users ${whereSQL}`, values);
        const total = countRows[0].total;
        const totalPages = Math.ceil(total / limit);
        // Main query with pagination (added isVerify ✅)
        const [rows] = yield db_1.pool.query(`SELECT id, userName, email, contact, address, role, isVerify, createdAt, updatedAt 
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
});
exports.getAllUser = getAllUser;
// ----------------- Get User By ID -----------------
const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const [rows] = yield db_1.pool.query("SELECT id, userName, email, contact, address, role FROM users WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(rows[0]);
    }
    catch (err) {
        next(err);
    }
});
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
const updateUserAccount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const { id } = req.params;
        // Handle the specific format {body: {isVerify: 0}}
        const requestBody = req.body.body || req.body;
        const data = requestBody.data || requestBody;
        let hashedPwd = null;
        if (data.password) {
            hashedPwd = yield bcrypt_1.default.hash(data.password, 10);
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
                (_a = data.userName) !== null && _a !== void 0 ? _a : null,
                (_b = data.email) !== null && _b !== void 0 ? _b : null,
                (_c = data.contact) !== null && _c !== void 0 ? _c : null,
                (_d = data.address) !== null && _d !== void 0 ? _d : null,
                (_e = data.role) !== null && _e !== void 0 ? _e : null,
                hashedPwd,
                (_f = data.isVerify) !== null && _f !== void 0 ? _f : null,
                id,
            ];
        }
        const [result] = yield db_1.pool.query(query, params);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User updated successfully" });
    }
    catch (err) {
        next(err);
    }
});
exports.updateUserAccount = updateUserAccount;
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        console.log("Deleting user with ID:", id); // 👈 log incoming id
        const [result] = yield db_1.pool.query("DELETE FROM users WHERE id = ?", [id]);
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
});
exports.deleteUser = deleteUser;
