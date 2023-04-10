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
            this.send_folder_data(socket);
            socket.on("save_new", (data) => {
                //TODO Saving code
            });
        });
    }
    send_client_data(socket) {
        var clientData = this.dataManager.getClientData();
        socket.emit("client_data", clientData);
        console.log("Sent client data!");
    }
    send_folder_data(socket) {
        var folderData = this.dataManager.getFolderData();
        socket.emit("folder_data", folderData);
        console.log("Sent folder data!");
    }
}
exports.ServerNetcode = ServerNetcode;
