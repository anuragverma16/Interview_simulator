export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const sendSuccess = (res, data, message = '', statusCode = 200) => {
  res.status(statusCode).json({ success: true, data, message });
};

export const sendError = (res, error, statusCode = 500, errors = []) => {
  res.status(statusCode).json({
    success: false,
    error: error.message || error,
    errors,
  });
};
