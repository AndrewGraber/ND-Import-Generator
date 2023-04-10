import { Server } from 'socket.io';
import { DataManager } from './data_manager';

interface ServerToClientEvents {
    client_data: (data: object) => void;
    folder_data: (data: object) => void;
}

interface ClientToServerEvents {
    save_new: (data: Array<Array<any>>) => void;
}

interface InterServerEvents {
    ping: () => void;
}

interface SocketData {
    name: string;
}

export class ServerNetcode {
    dataManager: DataManager;
    io: Server;

    constructor(httpServer: any, dataManager: DataManager) {
        this.dataManager = dataManager;
        this.io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
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

    send_client_data(socket: any) {
        var clientData = this.dataManager.getClientData();
        socket.emit("client_data", clientData);
        console.log("Sent client data!");
    }

    send_folder_data(socket: any) {
        var folderData = this.dataManager.getFolderData();
        socket.emit("folder_data", folderData);
        console.log("Sent folder data!");
    }
}