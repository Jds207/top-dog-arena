"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Simple health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Top Dog Arena API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// Simple test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Test endpoint working',
        timestamp: new Date().toISOString()
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
exports.default = app;
//# sourceMappingURL=test-server.js.map