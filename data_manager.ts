import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

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
    },
    children?: Array<FileData>
}

export class DataManager {
    private clientData: ClientMap;
    private folderToRead: string = "C:/Users/NetworkOverflow/Desktop/";

    constructor() {
        this.clientData = {};

        this.loadClientData();
    }

    getClientData() {
        return this.clientData;
    }

    static readFolderContents(dir: string): FileData[] {
        var output: Array<FileData> = [];
        var files = fs.readdirSync(dir);
        for(var file of files) {
            var curPath = path.join(dir, file);
            var fileData: FileData = {
                id: curPath,
                text: file,
                state: {
                    opened: false,
                    disabled: false,
                    selected: false
                }
            };
            var isDirectory  = fs.statSync(curPath).isDirectory();
            if(isDirectory) {
                fileData.icon = 'jstree-folder';
                fileData.children = DataManager.readFolderContents(curPath);
            } else {
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
}