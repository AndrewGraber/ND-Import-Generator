"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const server_netcode_1 = require("./server_netcode");
const data_manager_1 = require("./data_manager");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
const http = require('http');
const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
//const server = http.createServer(app);
const dataManager = new data_manager_1.DataManager();
const serverNetcode = new server_netcode_1.ServerNetcode(server, dataManager);
app.use(express_1.default.static('dist/public'));
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '/dist/public/index.html'));
});
/*function saveNewFile(new_data: Array<Array<string>>) {
    var success = true;
    const writableStream = fs.createWriteStream(config.OUT_FILE);
    const column_headers: Array<string> = [
        
    ];

    const csv_data = stringify(new_data, { header: true, columns: column_headers });
    
    fs.writeFile(config.OUT_FILE, csv_data, (err: any) => {
        if(err) {
            success = false;
            console.error(err);
        }
    });

    if(success) {
        console.log("Successfully saved new data to \'" + config.OUT_FILE + "\'!");
    } else {
        console.log("Error saving new data!");
    }

    return success;
}*/ 
