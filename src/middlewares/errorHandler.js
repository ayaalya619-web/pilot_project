const errorHandler = (err, req, res, next) => {
    console.error("❌ [Error Captured]:", err.message);

    let statusCode = 500;
    let message = err.message || "Internal Server Error";

    if (err.message.toLowerCase().includes("validation")) {
        statusCode = 400;
    }

    if (err.code && err.code.startsWith("P")) {
        statusCode = 409;
        message = "Database operation failed or constraint violation.";
    }

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        error: message
    });
};

module.exports = errorHandler;
