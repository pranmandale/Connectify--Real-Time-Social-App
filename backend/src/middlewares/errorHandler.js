export default function errorHandler(err, req, res, next) {
  // fallback in case err is undefined or not an Error
  if (!err) {
    err = {
      statusCode: 500,
      message: "Something went wrong",
    };
  }

  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
