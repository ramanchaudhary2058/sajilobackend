"use strict";
// import { NextFunction, Request, Response } from "express";
// import { user, room, booking } from "../types";
// import { Model } from "mongoose";
// import { DataFoundMessage } from "../const";
// import CustomError from "../middleware/CusomError";
// import { ObjectId } from "mongodb";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllEntities = exports.GetEntityById = exports.DeleteEntity = exports.UpdateEntity = exports.CreateEntity = void 0;
const db_1 = require("../db");
// ----------------- Create -----------------
const CreateEntity = (table, data) => __awaiter(void 0, void 0, void 0, function* () {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => "?").join(", ");
    const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;
    const [result] = yield db_1.pool.query(sql, values);
    return result.insertId;
});
exports.CreateEntity = CreateEntity;
// ----------------- Update -----------------
const UpdateEntity = (table, id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const keys = Object.keys(data);
    const values = Object.values(data);
    if (keys.length === 0)
        return false;
    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    const [result] = yield db_1.pool.query(sql, [...values, id]);
    return result.affectedRows > 0;
});
exports.UpdateEntity = UpdateEntity;
// ----------------- Delete -----------------
const DeleteEntity = (table, id) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `DELETE FROM ${table} WHERE id = ?`;
    const [result] = yield db_1.pool.query(sql, [id]);
    return result.affectedRows > 0;
});
exports.DeleteEntity = DeleteEntity;
// ----------------- Get By ID -----------------
const GetEntityById = (table, id) => __awaiter(void 0, void 0, void 0, function* () {
    if (table === "bookings") {
        const [rows] = yield db_1.pool.query(`SELECT b.*, u.userName, u.email, u.contact, u.address,
              r.hostelName, r.location, r.price, r.imgUrl
       FROM bookings b
       JOIN users u ON b.userId = u.id
       JOIN rooms r ON b.roomId = r.id
       WHERE b.id = ?`, [id]);
        return rows[0] || null;
    }
    const [rows] = yield db_1.pool.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    return rows[0] || null;
});
exports.GetEntityById = GetEntityById;
// ----------------- Get All -----------------
const GetAllEntities = (table) => __awaiter(void 0, void 0, void 0, function* () {
    if (table === "bookings") {
        const [rows] = yield db_1.pool.query(`SELECT b.*, u.userName, u.email, u.contact, u.address,
              r.hostelName, r.location, r.price, r.imgUrl
       FROM bookings b
       JOIN users u ON b.userId = u.id
       JOIN rooms r ON b.roomId = r.id`);
        return rows;
    }
    const [rows] = yield db_1.pool.query(`SELECT * FROM ${table}`);
    return rows;
});
exports.GetAllEntities = GetAllEntities;
