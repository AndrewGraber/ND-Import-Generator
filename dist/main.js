"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use(express_1.default.static('dist/public'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/dist/public/index.html'));
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
