"use strict";
// import { NextFunction, Request, Response } from "express";
// import { user, room, booking } from "../types";
// import { Model } from "mongoose";
// import { DataFoundMessage } from "../const";
// import CustomError from "../middleware/CusomError";
// import { ObjectId } from "mongodb";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllEntities = exports.GetEntityById = exports.DeleteEntity = exports.UpdateEntity = exports.CreateEntity = void 0;
const db_1 = require("../db");
// ----------------- Create -----------------
const CreateEntity = async (table, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => "?").join(", ");
    const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;
    const [result] = await db_1.pool.query(sql, values);
    return result.insertId;
};
exports.CreateEntity = CreateEntity;
// ----------------- Update -----------------
const UpdateEntity = async (table, id, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    if (keys.length === 0)
        return false;
    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    const [result] = await db_1.pool.query(sql, [...values, id]);
    return result.affectedRows > 0;
};
exports.UpdateEntity = UpdateEntity;
// ----------------- Delete -----------------
const DeleteEntity = async (table, id) => {
    const sql = `DELETE FROM ${table} WHERE id = ?`;
    const [result] = await db_1.pool.query(sql, [id]);
    return result.affectedRows > 0;
};
exports.DeleteEntity = DeleteEntity;
// ----------------- Get By ID -----------------
const GetEntityById = async (table, id) => {
    if (table === "bookings") {
        const [rows] = await db_1.pool.query(`SELECT b.*, u.userName, u.email, u.contact, u.address,
              r.hostelName, r.location, r.price, r.imgUrl
       FROM bookings b
       JOIN users u ON b.userId = u.id
       JOIN rooms r ON b.roomId = r.id
       WHERE b.id = ?`, [id]);
        return rows[0] || null;
    }
    const [rows] = await db_1.pool.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    return rows[0] || null;
};
exports.GetEntityById = GetEntityById;
// ----------------- Get All -----------------
const GetAllEntities = async (table) => {
    if (table === "bookings") {
        const [rows] = await db_1.pool.query(`SELECT b.*, u.userName, u.email, u.contact, u.address,
              r.hostelName, r.location, r.price, r.imgUrl
       FROM bookings b
       JOIN users u ON b.userId = u.id
       JOIN rooms r ON b.roomId = r.id`);
        return rows;
    }
    const [rows] = await db_1.pool.query(`SELECT * FROM ${table}`);
    return rows;
};
exports.GetAllEntities = GetAllEntities;
