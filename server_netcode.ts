import { Server } from 'socket.io';
import { DataManager } from './data_manager';

interface ServerToClientEvents {
    client_data: (data: object) => void;
    file_node: (data: object) => void;
    root_folder_path: (filepath: string) => void;
}

interface ClientToServerEvents {
    get_file_node: (filepath: any, callback: (fileNodeData: object) => void) => void;
    save_new: (data: Array<Array<any>>, filename: string) => void;
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

    send_client_data(socket: any) {
        var clientData = this.dataManager.getClientData();
        socket.emit("client_data", clientData);
        console.log("Sent client data!");
    }

    send_root_folder_path(socket: any) {
        var root_folder_path = this.dataManager.getRootFolderPath();
        socket.emit("root_folder_path", root_folder_path);
    }
}