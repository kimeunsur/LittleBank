"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminModel = void 0;
const loaders_1 = require("../loaders");
const tablename_1 = __importDefault(require("./tablename"));
class AdminModel {
    async createAdmin(options, connection) {
        const { insertId } = await loaders_1.db.query({
            connection,
            sql: `INSERT INTO ?? SET ?`,
            values: [tablename_1.default.admin, Object.assign({}, options)]
        });
        return insertId;
    }
    async findOneAdminById(adminId, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `SELECT * FROM ?? WHERE ? AND isDeleted != 1`,
            values: [tablename_1.default.admin, { adminId }]
        });
        return row;
    }
    async findOneAdminByEmail(email, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `SELECT * FROM ?? WHERE ? AND isDeleted != 1`,
            values: [tablename_1.default.admin, { email }]
        });
        return row;
    }
}
exports.adminModel = new AdminModel();
