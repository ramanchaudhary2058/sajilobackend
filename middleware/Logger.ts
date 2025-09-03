import path from "path";
import fs from "fs";
import { NextFunction, Request, Response } from "express";

const fsPromises = fs.promises;

class Logger {
  async logEvents(msg: string, fileName: string) {
    const folderPath = path.join(__dirname, "..", "logs");
    const time = new Date().toUTCString();
    const logItem = `${time}\t${msg}\n`;
    try {
      if (!fs.existsSync(folderPath)) {
        await fsPromises.mkdir(folderPath);
      }
      await fsPromises.appendFile(
        path.join(__dirname, "..", "logs", fileName),
        logItem
      );
    } catch (error) {
      console.log(error);
    }
  }

  static logger(req: Request, res: Response, next: NextFunction) {
    new Logger().logEvents(
      `${req.method}\t${req.url}\t${req.headers.origin}`,
      "reqLog.log"
    );
    next();
  }

  static errorLogger(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    console.log("Global error handler");
    new Logger().logEvents(
      `${req.method}\t${req.url}\t${req.headers.host}\t${err.stack}\t${err.message}\t${err.name}`,
      "error.log"
    );
    return developmentError(err, res);
  }
}

interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  errors?: { message: string }[];
  name: string;
}

const developmentError = (err: CustomError, res: Response) => {
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

const productionError = (err: CustomError, res: Response) => {
  console.log("Prod Error  :::  ");
  let statusCode = err.statusCode || 500;
  let status = err.status || "error";
  let message = err.message || "Something went wrong!";
  return res.status(statusCode).json({
    status: status,
    message: message,
  });
};

export default Logger.errorLogger;
