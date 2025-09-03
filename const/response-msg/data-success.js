"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataFoundMessage = void 0;
// Make it generic so it works with any type
const DataFoundMessage = (res, data, msg = "Success!!!") => {
    return res.status(200).json({
        success: true,
        msg,
        data,
    });
};
exports.DataFoundMessage = DataFoundMessage;
// import { Response } from "express";
// import { room, user, booking } from "../../types";
// export const DataFoundMessage = (
//   res: Response,
//   data: user | room | booking | null | user[] | room[] | booking[],
//   msg: string = "Success!!!"
// ) => {
//   return res.status(200).json({
//     data,
//     msg,
//   });
// };
