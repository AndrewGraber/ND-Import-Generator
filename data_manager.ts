import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import moment from 'moment';
import dotenv from 'dotenv';

type RawMatterData = {
    MatterNumber: number;
    MatterName: string;
    ContactName: string;
    ContactNumber: number;
}

type Client = {
    name: string;
    matters: MatterMap;
}

type ClientMap = Record<number, Client>

type MatterMap = Record<number, string>

type FileData = {
    id: string;
    text: string;
    icon?: string;
    state: {
        opened: boolean;
        disabled: boolean;
        selected: boolean;
    };
    children?: Array<string>|boolean;
    author?: string;
    created_date?: string;
    modified_date?: string;
    empty?: boolean;
}

var ignoredFiles = [
    "Thumbs.db"
];

export class DataManager {
    private clientData: ClientMap;
    private folderToRead: string|undefined;

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

    getFileNode(filePathIn: string) {
        if(filePathIn == '#' && this.folderToRead) filePathIn = this.folderToRead;

        if(!fs.statSync(filePathIn).isDirectory()) {
            return [];
        }

        var output: Array<FileData> = [];
        var files = fs.readdirSync(filePathIn);

        for(var file of files) {
            var curPath = path.join(filePathIn, file);
            var fileData: FileData = {
                id: curPath.replace(/\\/g, "/"),
                text: file,
                state: {
                    opened: false,
                    disabled: false,
                    selected: false
                }
            };

            if(ignoredFiles.includes(file)) continue;

            var fileStats = fs.statSync(curPath);
            if(fileStats.isDirectory()) {
                fileData.icon = 'jstree-folder';

                var childFiles = fs.readdirSync(curPath);
                fileData.children = childFiles.length > 0;
                fileData.empty = childFiles.length == 0;
            } else {
                fileData.icon = 'jstree-file';
            }

            fileData.author = "Cynthia P Helfrich";
            fileData.created_date = moment(fileStats.birthtime).format('YYYY-MM-DD HH:mm');
            fileData.modified_date = moment(fileStats.mtime).format('YYYY-MM-DD HH:mm');

            output.push(fileData);
        }

        return output;
    }

    loadClientData() {
        console.log("Loading Client Data from 'HLO_Matters_With_Contacts.csv'...");

        const csvFilePath = path.resolve(__dirname, '../HLO_Matters_With_Contacts.csv');
        const headers = ['MatterNumber', 'MatterName', 'ContactName', 'ContactNumber'];
        const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

        var result: RawMatterData[] = parse(fileContent, {
            delimiter: ',',
            columns: headers
        });

        for(var data of result) {
            if(this.clientData.hasOwnProperty(data.ContactNumber)) {
                this.clientData[data.ContactNumber].matters[data.MatterNumber] = data.MatterName;
            } else {
                var matterMap: MatterMap = {};
                matterMap[data.MatterNumber] = data.MatterName;

                this.clientData[data.ContactNumber] = {
                    name: data.ContactName,
                    matters: matterMap
                }
            }
        }

        console.log("Client Data Loaded!");
    }

    saveImportData(data_in: Array<Array<any>>, filename: string) {
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

        var csvData = stringify(data_in, { header: true, columns: outputHeaders });
        fs.writeFileSync(filename, csvData);
    }
}