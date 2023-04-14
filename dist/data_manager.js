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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sync_1 = require("csv-parse/sync");
const sync_2 = require("csv-stringify/sync");
const moment_1 = __importDefault(require("moment"));
var ignoredFiles = [
    "Thumbs.db"
];
class DataManager {
    constructor() {
        this.clientData = {};
        this.folderToRead = process.env.ROOT_FOLDER;
        this.loadClientData();
    }
    getClientData() {
        return this.clientData;
    }
    getRootFolderPath() {
        return this.folderToRead;
    }
    getFileNode(filePathIn) {
        if (filePathIn == '#' && this.folderToRead)
            filePathIn = this.folderToRead;
        if (!fs.statSync(filePathIn).isDirectory()) {
            return [];
        }
        var output = [];
        var files = fs.readdirSync(filePathIn);
        for (var file of files) {
            var curPath = path.join(filePathIn, file);
            var fileData = {
                id: curPath.replace(/\\/g, "/"),
                text: file,
                state: {
                    opened: false,
                    disabled: false,
                    selected: false
                }
            };
            if (ignoredFiles.includes(file))
                continue;
            var fileStats = fs.statSync(curPath);
            if (fileStats.isDirectory()) {
                fileData.icon = 'jstree-folder';
                var childFiles = fs.readdirSync(curPath);
                fileData.children = childFiles.length > 0;
                fileData.empty = childFiles.length == 0;
            }
            else {
                fileData.icon = 'jstree-file';
            }
            fileData.author = "Cynthia P Helfrich";
            fileData.created_date = (0, moment_1.default)(fileStats.birthtime).format('YYYY-MM-DD HH:mm');
            fileData.modified_date = (0, moment_1.default)(fileStats.mtime).format('YYYY-MM-DD HH:mm');
            output.push(fileData);
        }
        return output;
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
    saveImportData(data_in, filename) {
        var outputHeaders = [
            "filepath",
            "Client",
            "Matter",
            "Doc Type",
            "Comments",
            "DOCUMENT NAME",
            "DOCUMENT EXTENSION",
            "CREATED BY",
            "CREATED DATE",
            "LAST MODIFIED BY",
            "LAST MODIFIED DATE"
        ];
        var csvData = (0, sync_2.stringify)(data_in, { header: true, columns: outputHeaders });
        fs.writeFileSync(filename, csvData);
    }
}
exports.DataManager = DataManager;
