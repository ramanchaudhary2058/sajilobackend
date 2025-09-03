export interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

class AppError extends Error implements CustomError {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    console.log("main");
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
