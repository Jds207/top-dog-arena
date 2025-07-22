"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganStream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
// Define custom log levels
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Define log colors
const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
// Add colors to winston
winston_1.default.addColors(logColors);
// Define log format
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
// Define transports
const transports = [
    // Console transport
    new winston_1.default.transports.Console({
        format: logFormat,
    }),
    // File transport for errors
    new winston_1.default.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    }),
    // File transport for all logs
    new winston_1.default.transports.File({
        filename: 'logs/combined.log',
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    }),
];
// Create the logger
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels: logLevels,
    transports,
    exceptionHandlers: [
        new winston_1.default.transports.File({ filename: 'logs/exceptions.log' }),
    ],
    rejectionHandlers: [
        new winston_1.default.transports.File({ filename: 'logs/rejections.log' }),
    ],
});
// Create a stream object for Morgan
exports.morganStream = {
    write: (message) => {
        exports.logger.http(message.trim());
    },
};
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map