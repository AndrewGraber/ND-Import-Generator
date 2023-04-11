"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerNetcode = void 0;
const socket_io_1 = require("socket.io");
class ServerNetcode {
    constructor(httpServer, dataManager) {
        this.dataManager = dataManager;
        this.io = new socket_io_1.Server(httpServer, {
            maxHttpBufferSize: 1e8
        });
        this.register_handlers();
    }
    register_handlers() {
        this.io.on('connection', (socket) => {
            this.send_client_data(socket);
            socket.on("save_new", (data, filename) => {
                this.dataManager.saveImportData(data, filename);
                console.log("Saved your import data to '" + __dirname + filename);
            });
            socket.on("get_file_node", (filepath, respond) => {
                var fileData = this.dataManager.getFileNode(filepath);
                respond({ nodes: fileData });
                console.log("Sent file node for '" + filepath + "'");
            });
        });
    }
    send_client_data(socket) {
        var clientData = this.dataManager.getClientData();
        socket.emit("client_data", clientData);
        console.log("Sent client data!");
    }
}
exports.ServerNetcode = ServerNetcode;
