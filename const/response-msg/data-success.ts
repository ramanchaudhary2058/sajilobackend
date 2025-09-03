import { Response } from "express";
import { room, user, Booking } from "../../types";

// Make it generic so it works with any type
export const DataFoundMessage = <T>(
  res: Response,
  data: T | T[] | null,
  msg: string = "Success!!!"
) => {
  return res.status(200).json({
    success: true,
    msg,
    data,
  });
};

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
