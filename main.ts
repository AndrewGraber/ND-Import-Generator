import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
    maxHttpBufferSize: 1e8
});

const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const random_name = require('node-random-name');

app.use(express.static('dist/public'));

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '/dist/public/index.html'));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

//Config Values
const config = {
    OUT_FILE: "./ImportDescription.csv"
};

function saveNewFile(new_data: Array<Array<string>>) {
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
}