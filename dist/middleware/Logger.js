"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const fsPromises = fs_1.default.promises;
class Logger {
    async logEvents(msg, fileName) {
        const folderPath = path_1.default.join(__dirname, "..", "logs");
        const time = new Date().toUTCString();
        const logItem = `${time}\t${msg}\n`;
        try {
            if (!fs_1.default.existsSync(folderPath)) {
                await fsPromises.mkdir(folderPath);
            }
            await fsPromises.appendFile(path_1.default.join(__dirname, "..", "logs", fileName), logItem);
        }
        catch (error) {
            console.log(error);
        }
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
