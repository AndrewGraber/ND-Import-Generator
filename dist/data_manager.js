"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sync_1 = require("csv-parse/sync");
class DataManager {
    constructor() {
        this.folderToRead = "Z:/company/WP51/Data/_Andrew/";
        this.clientData = {};
        this.loadClientData();
    }
    getClientData() {
        return this.clientData;
    }
    getFileNode(filePathIn) {
        var output = [];
        fs.readdir(filePathIn, (err, files) => {
            if (err) {
                console.error(err);
                return [];
            }
            else {
                for (var file of files) {
                    var curPath = path.join(filePathIn, file);
                    var fileData = {
                        id: curPath,
                        text: file,
                        state: {
                            opened: false,
                            disabled: false,
                            selected: false
                        }
                    };
                    var isDirectory = fs.statSync(curPath).isDirectory();
                    if (isDirectory) {
                        fileData.icon = 'jstree-folder';
                    }
                    else {
                        fileData.icon = 'jstree-file';
                    }
                    output.push(fileData);
                }
                return output;
            }
        });
    }
    static readFolderContents(dir) {
        var output = [];
        var files = fs.readdirSync(dir);
        for (var file of files) {
            var curPath = path.join(dir, file);
            var fileData = {
                id: curPath,
                text: file,
                state: {
                    opened: false,
                    disabled: false,
                    selected: false
                }
            };
            var isDirectory = fs.statSync(curPath).isDirectory();
            if (isDirectory) {
                fileData.icon = 'jstree-folder';
                fileData.children = DataManager.readFolderContents(curPath);
            }
            else {
                fileData.icon = 'jstree-file';
                fileData.children = [];
            }
            output.push(fileData);
        }
        return output;
    }
    getFolderData() {
        var folderData = DataManager.readFolderContents(this.folderToRead);
        return folderData;
    }
    loadClientData() {
        console.log("Loading Client Data from 'HLO_Matters_With_Contacts.csv'...");
        const csvFilePath = path.resolve(__dirname, '../HLO_Matters_With_Contacts.csv');
        const headers = ['MatterNumber', 'MatterName', 'ContactName', 'ContactNumber'];
        const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
        var result = (0, sync_1.parse)(fileContent, {
            delimiter: ',',
            columns: headers
        });
        for (var data of result) {
            if (this.clientData.hasOwnProperty(data.ContactNumber)) {
                this.clientData[data.ContactNumber].matters[data.MatterNumber] = data.MatterName;
            }
            else {
                var matterMap = {};
                matterMap[data.MatterNumber] = data.MatterName;
                this.clientData[data.ContactNumber] = {
                    name: data.ContactName,
                    matters: matterMap
                };
            }
        }
        console.log("Client Data Loaded!");
    }
    saveImportData(data_in) {
        var outputHeaders = [
            "filepath",
            "Client",
            "Matter",
            "Author",
            "Doc Type",
            "DOCUMENT NAME",
            "DOCUMENT EXTENSION",
            "ACCESS",
            "CREATED BY",
            "CREATED DATE",
            "LAST MODIFIED BY",
            "LAST MODIFIED DATE"
        ];
    }
}
exports.DataManager = DataManager;
