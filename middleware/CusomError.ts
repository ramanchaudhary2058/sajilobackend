import { NextFunction } from "express";
import AppError from "./AppError";

const throwError = (msg: string, code: number, next: NextFunction) => {
  return next(new AppError(msg, code));
};

class CustomError {
  static unAuthorizedError = (next: NextFunction) => {
    return throwError(
      "You donot have that privilige to do such action",
      401,
      next
    );
  };

  static invalidField = (next: NextFunction) => {
    return throwError("please provide the correct data", 401, next);
  };

  static notVerify = (next: NextFunction) => {
    return throwError("Your account hasn't been verified yet!!!", 402, next);
  };

  static tryCatchError = (next: NextFunction) => {
    return throwError("Something went wrong!!!", 400, next);
  };

  static noTokenError = (next: NextFunction) => {
    return throwError(
      "Please signin with your registered account!!!",
      401,
      next
    );
  };

  static entityAlreadyExistsError = (next: NextFunction) => {
    return throwError(
      "Given entity has already been registered, try with new one !!!",
      400,
      next
    );
  };

  static entityPropsMissingError = (next: NextFunction) => {
    return throwError("Please fill the required fields !!!", 400, next);
  };

  static searchEntityMissingError = (next: NextFunction) => {
    return throwError(
      "There were no records present that matches the field you provided !!!",
      400,
      next
    );
  };

  static foriegnKeyUsed = (next: NextFunction) => {
    return throwError(
      "Current id is being used as connecting key with other table. So, try altering that first.",
      400,
      next
    );
  };
}

export default CustomError;
