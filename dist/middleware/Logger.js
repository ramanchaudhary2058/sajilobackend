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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const fsPromises = fs_1.default.promises;
class Logger {
    logEvents(msg, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const folderPath = path_1.default.join(__dirname, "..", "logs");
            const time = new Date().toUTCString();
            const logItem = `${time}\t${msg}\n`;
            try {
                if (!fs_1.default.existsSync(folderPath)) {
                    yield fsPromises.mkdir(folderPath);
                }
                yield fsPromises.appendFile(path_1.default.join(__dirname, "..", "logs", fileName), logItem);
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    static logger(req, res, next) {
        new Logger().logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
        next();
    }
    static errorLogger(err, req, res, next) {
        console.log("Global error handler");
        new Logger().logEvents(`${req.method}\t${req.url}\t${req.headers.host}\t${err.stack}\t${err.message}\t${err.name}`, "error.log");
        return developmentError(err, res);
    }
}
const developmentError = (err, res) => {
    console.log("Devs Error  :::  ");
    let statusCode = err.statusCode || 500;
    let status = err.status || "error";
    let message = err.message || "Something went wrong!";
    return res.status(statusCode).json({
        status: status,
        message: message,
        stack: err.stack,
        error: err,
    });
};
const productionError = (err, res) => {
    console.log("Prod Error  :::  ");
    let statusCode = err.statusCode || 500;
    let status = err.status || "error";
    let message = err.message || "Something went wrong!";
    return res.status(statusCode).json({
        status: status,
        message: message,
    });
};
exports.default = Logger.errorLogger;
