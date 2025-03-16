"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const loaders_1 = require("../loaders");
const tablename_1 = __importDefault(require("./tablename"));
class UserModel {
    async createUser(options, connection) {
        const { insertId } = await loaders_1.db.query({
            connection,
            sql: `INSERT INTO ?? SET ?`,
            values: [tablename_1.default.user, Object.assign({}, options)]
        });
        return insertId;
    }
    async findOneUserByEmail(email, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `SELECT * FROM ?? WHERE ? AND isDeleted != 1`,
            values: [tablename_1.default.user, { email }]
        });
        return row;
    }
    async updateUserById(userId, options, connection) {
        const { affectedRows } = await loaders_1.db.query({
            connection,
            sql: `UPDATE ?? SET ? WHERE ?`,
            values: [tablename_1.default.user, Object.assign({}, options), { userId }]
        });
        return affectedRows;
    }
    async deleteUser(userId, connection) {
        const { affectedRows } = await loaders_1.db.query({
            connection,
            sql: `
        UPDATE
          ?? u
        JOIN
          ?? p ON p.userId = u.userId
        SET
          u.isDeleted = true, u.deletedAt = now(),
          p.isDeleted = true, p.deletedAt = now()
        WHERE
          u.?`,
            values: [tablename_1.default.user, tablename_1.default.profile, { userId }]
        });
        return affectedRows;
    }
}
exports.userModel = new UserModel();
