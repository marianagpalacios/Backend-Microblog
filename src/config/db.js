const MongoClient = require('mongodb').MongoClient;
const { logError } = require('../utils/logger');

const url = 'mongodb://127.0.0.1:27017';
const dbName = 'microblog';

let db;

function connectDB() {
    return new Promise(function (resolve, reject) {
        if (db) {
            resolve(db);
            return;
        }

        MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
            if (err) {
                logError('connectDB', err);
                reject(err);
                return;
            }

            db = client.db(dbName);
            console.log('Conectado ao MongoDB');
            resolve(db);
        });
    });
}

module.exports = connectDB;