"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("./AppError"));
const throwError = (msg, code, next) => {
    return next(new AppError_1.default(msg, code));
};
class CustomError {
}
CustomError.unAuthorizedError = (next) => {
    return throwError("You donot have that privilige to do such action", 401, next);
};
CustomError.invalidField = (next) => {
    return throwError("please provide the correct data", 401, next);
};
CustomError.notVerify = (next) => {
    return throwError("Your account hasn't been verified yet!!!", 402, next);
};
CustomError.tryCatchError = (next) => {
    return throwError("Something went wrong!!!", 400, next);
};
CustomError.noTokenError = (next) => {
    return throwError("Please signin with your registered account!!!", 401, next);
};
CustomError.entityAlreadyExistsError = (next) => {
    return throwError("Given entity has already been registered, try with new one !!!", 400, next);
};
CustomError.entityPropsMissingError = (next) => {
    return throwError("Please fill the required fields !!!", 400, next);
};
CustomError.searchEntityMissingError = (next) => {
    return throwError("There were no records present that matches the field you provided !!!", 400, next);
};
CustomError.foriegnKeyUsed = (next) => {
    return throwError("Current id is being used as connecting key with other table. So, try altering that first.", 400, next);
};
exports.default = CustomError;
