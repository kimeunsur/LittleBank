"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatArray = exports.generateRandomHash = exports.generateRandomCode = exports.reduceNull = exports.rollback = exports.commit = exports.beginTransaction = exports.getConnection = exports.query = exports.init = void 0;
const config_1 = __importDefault(require("config"));
const mysql_1 = __importDefault(require("mysql"));
const _1 = require("./");
const aws_1 = require("./aws");
const libs_1 = require("../libs");
const os_1 = __importDefault(require("os"));
const awsSecrets = config_1.default.get('aws.secrets');
const dbConfig = config_1.default.get('database');
let pool;
async function init() {
    try {
        const { host, port, user, password, database } = await (0, aws_1.getSecretValue)(awsSecrets.mysql);
        const config = Object.assign({ host,
            port,
            user,
            password,
            database }, dbConfig);
        pool = mysql_1.default.createPool(Object.assign(Object.assign({}, config), { typeCast(field, next) {
                if ((field.type === 'TINY' || field.type === 'TINYINT') && field.length === 1) {
                    return field.string() === '1';
                }
                if (field.type === 'JSON') {
                    const json = JSON.parse(field.string());
                    if (Array.isArray(json))
                        return json.filter((i) => i);
                    return json;
                }
                return next();
            } }));
        _1.logger.debug('Mysql loaded');
    }
    catch (e) {
        throw e;
    }
}
exports.init = init;
async function query(options) {
    return new Promise((resolve, reject) => {
        try {
            const target = options.connection ? options.connection : pool;
            const sql = mysql_1.default.format(options.sql, options.values, options.stringifyObjects, options.timeZone);
            if (os_1.default.hostname() === 'ingoodhandsui-MacBookPro.local') {
                _1.logger.debug(sql);
            }
            target.query({ sql, nestTables: options.nestTables }, (eor, results) => {
                if (eor)
                    reject(eor);
                else
                    resolve(results);
            });
        }
        catch (e) {
            reject(e);
        }
    });
}
exports.query = query;
async function getConnection() {
    return new Promise((resolve, reject) => {
        try {
            pool.getConnection((e, connection) => {
                if (e)
                    reject(e);
                else {
                    resolve(connection);
                }
            });
        }
        catch (e) {
            reject(e);
        }
    });
}
exports.getConnection = getConnection;
async function rollback(connection) {
    return new Promise((resolve, reject) => {
        try {
            connection.rollback((e) => {
                if (e)
                    reject(e);
                else {
                    connection.release();
                    resolve();
                }
            });
        }
        catch (e) {
            reject(e);
        }
    });
}
exports.rollback = rollback;
async function beginTransaction() {
    return new Promise((resolve, reject) => {
        try {
            getConnection()
                .then((connection) => {
                connection.beginTransaction((e) => {
                    if (e)
                        reject(rollback(connection));
                    else
                        resolve(connection);
                });
            })
                .catch((e) => reject(e));
        }
        catch (e) {
            reject(e);
        }
    });
}
exports.beginTransaction = beginTransaction;
async function commit(connection) {
    return new Promise((resolve, reject) => {
        try {
            connection.commit((e) => {
                if (e)
                    reject(rollback(connection));
                else {
                    connection.release();
                    resolve();
                }
            });
        }
        catch (e) {
            reject(e);
        }
    });
}
exports.commit = commit;
function reduceNull(rows, property, key, keyToInt) {
    try {
        return rows.map((row) => {
            if (!Array.isArray(row[property])) {
                row[property] = Object.keys(row[property]).reduce((prev, curr) => {
                    if (curr !== 'null') {
                        const newItem = row[property][curr];
                        newItem[key] = keyToInt ? parseInt(curr, 10) : curr;
                        prev.push(newItem);
                    }
                    return prev;
                }, []);
            }
            row[property] = row[property].reduce((prev, curr) => {
                if (curr[key])
                    prev.push(curr);
                return prev;
            }, []);
            return row;
        });
    }
    catch (e) {
        return rows;
    }
}
exports.reduceNull = reduceNull;
async function generateRandomCode(tableName, digit, prefix = '', key = 'id') {
    try {
        const id = libs_1.code.generateRandomCode(digit);
        const rows = await query({
            sql: `SELECT ?? FROM ?? WHERE ?? = ?`,
            values: [key, tableName, key, prefix + id]
        });
        if (rows.length) {
            return await generateRandomCode(tableName, digit, prefix, key);
        }
        return id;
    }
    catch (e) {
        throw e;
    }
}
exports.generateRandomCode = generateRandomCode;
async function generateRandomHash(tableName, digit, key = 'id') {
    try {
        const id = libs_1.code.generateRandomHash(digit);
        const rows = await query({
            sql: `SELECT ?? FROM ?? WHERE ?? = ?`,
            values: [key, tableName, key, id]
        });
        if (rows.length) {
            return await generateRandomHash(tableName, digit, key);
        }
        return id;
    }
    catch (e) {
        throw e;
    }
}
exports.generateRandomHash = generateRandomHash;
function formatArray(options) {
    try {
        const keys = Object.keys(options);
        return keys.map((key) => {
            let column;
            if (key.indexOf('.') !== -1) {
                const values = key.split('.');
                column = values.reduce((prev, curr) => `\`${prev}\`.\`${curr}\``);
            }
            else
                column = `\`${key}\``;
            return `${column} = ${typeof options[key] === 'string' ? `'${options[key]}'` : options[key]}`;
        });
    }
    catch (e) {
        throw e;
    }
}
exports.formatArray = formatArray;
