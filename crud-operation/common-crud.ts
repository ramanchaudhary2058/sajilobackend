// import { NextFunction, Request, Response } from "express";
// import { user, room, booking } from "../types";
// import { Model } from "mongoose";
// import { DataFoundMessage } from "../const";
// import CustomError from "../middleware/CusomError";
// import { ObjectId } from "mongodb";

// export const CreateEntity = async <T extends user | room | booking>(
//   req: Request,
//   res: Response,
//   next: NextFunction,
//   model: Model<T>,
//   data: user | room | booking
// ) => {
//   try {
//     const saveData = new model(data);
//     console.log(data);
//     await saveData.save();
//     return DataFoundMessage(res, saveData, "Entity created successfully!!!");
//   } catch (error) {
//     next(error);
//   }
// };

// export const FetchOneEntity = async <T extends user | room | booking>(
//   req: Request,
//   res: Response,
//   next: NextFunction,
//   model: Model<T>,
//   data: user | room | booking
// ) => {
//   try {
//     const saveData = new model(data);
//     await saveData.save();
//     return DataFoundMessage(res, saveData, "Entity created successfully!!!");
//   } catch (error) {
//     next(error);
//   }
// };

// export const FetchOneEntityById = async <T extends user | room | booking>(
//   req: Request,
//   res: Response,
//   next: NextFunction,
//   model: Model<T>
// ) => {
//   try {
//     const searchEntity = await model.findById(req.params.id);
//     if (!searchEntity) {
//       return CustomError.searchEntityMissingError(next);
//     }
//     return DataFoundMessage(res, searchEntity);
//   } catch (error) {
//     next(error);
//   }
// };

// export const GetAllEntites = async <T extends user | room | booking>(
//   req: Request,
//   res: Response,
//   next: NextFunction,
//   model: Model<T>
// ) => {
//   try {
//     const searchEntity = await model.find();
//     if (!searchEntity) {
//       return CustomError.searchEntityMissingError(next);
//     }
//     return res.status(200).json({
//       data: searchEntity,
//       msg: "Entity has been fetched succesfully!!!",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const UpdateEntity = async <T extends user | room | booking>(
//   req: Request,
//   res: Response,
//   next: NextFunction,
//   model: Model<T>,
//   callback: () => {}
// ) => {
//   try {
//     const userId = req.params.id;
//     console.log(userId);

//     const searchUser = await model.findById(userId);

//     if (searchUser) {
//       const updatedEntity = callback();
//       console.log(updatedEntity);

//       await model.findByIdAndUpdate(req.params.id, updatedEntity);
//       res.status(200).json({ data: updatedEntity, msg: "Success" });
//     } else {
//       return CustomError.searchEntityMissingError(next);
//     }
//   } catch (error) {
//     next(error);
//   }
// };

// export const DeleteEntity = async <T extends user | room | booking>(
//   req: Request,
//   res: Response,
//   next: NextFunction,
//   model: Model<T>
// ) => {
//   try {
//     const searchForEntity = await model.findById(req.params.id);
//     if (searchForEntity) {
//       await model.deleteOne({ _id: req.params.id });
//       res.status(200).send("Entity has been deleted successfully");
//     } else {
//       res.status(404).send("Sorry, the entity does not exist");
//     }
//   } catch (error) {
//     next(error);
//   }
// };
// src/crud-operation/common-crud.tsimport { pool } from "../db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../db";

// ----------------- Create -----------------
export const CreateEntity = async (table: string, data: Record<string, any>) => {
  const keys = Object.keys(data);
  const values = Object.values(data);

  const placeholders = keys.map(() => "?").join(", ");
  const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;

  const [result] = await pool.query<ResultSetHeader>(sql, values);
  return result.insertId;
};

// ----------------- Update -----------------
export const UpdateEntity = async (table: string, id: number, data: Record<string, any>) => {
  const keys = Object.keys(data);
  const values = Object.values(data);

  if (keys.length === 0) return false;

  const setClause = keys.map((key) => `${key} = ?`).join(", ");
  const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;

  const [result] = await pool.query<ResultSetHeader>(sql, [...values, id]);
  return result.affectedRows > 0;
};

// ----------------- Delete -----------------
export const DeleteEntity = async (table: string, id: number) => {
  const sql = `DELETE FROM ${table} WHERE id = ?`;
  const [result] = await pool.query<ResultSetHeader>(sql, [id]);
  return result.affectedRows > 0;
};

// ----------------- Get By ID -----------------
export const GetEntityById = async (table: string, id: number) => {
  if (table === "bookings") {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT b.*, u.userName, u.email, u.contact, u.address,
              r.hostelName, r.location, r.price, r.imgUrl
       FROM bookings b
       JOIN users u ON b.userId = u.id
       JOIN rooms r ON b.roomId = r.id
       WHERE b.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  return rows[0] || null;
};

// ----------------- Get All -----------------
export const GetAllEntities = async (table: string) => {
  if (table === "bookings") {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT b.*, u.userName, u.email, u.contact, u.address,
              r.hostelName, r.location, r.price, r.imgUrl
       FROM bookings b
       JOIN users u ON b.userId = u.id
       JOIN rooms r ON b.roomId = r.id`
    );
    return rows;
  }

  const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM ${table}`);
  return rows;
};
