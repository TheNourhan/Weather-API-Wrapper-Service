class AppError extends Error {
  statusCode: number;
  statusText: string;

  constructor(message: string, statusCode: number, statusText: string) {
    super(message);

    this.statusCode = statusCode;
    this.statusText = statusText;

    // Fix prototype chain (important when extending Error)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default AppError;
