"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowanceModel = void 0;
const loaders_1 = require("../loaders");
const tablename_1 = __importDefault(require("./tablename"));
class AllowanceModel {
    async createAllowanceTask(options, connection) {
        const { insertId } = await loaders_1.db.query({
            connection,
            sql: `INSERT INTO ?? SET ?`,
            values: [tablename_1.default.allowanceTask, Object.assign({}, options)]
        });
        return insertId;
    }
    async findOneAllowanceTask(allowanceTaskId, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          *
        FROM
          ??                
        WHERE
          ? AND isDeleted != 1
      `,
            values: [tablename_1.default.allowanceTask, { allowanceTaskId }]
        });
        return row;
    }
    async findAllAllowanceTasks(userId, options, connection) {
        const { page, perPage } = options;
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          *         
        FROM
          ??                
        WHERE
          ? AND isDeleted != 1
        ORDER BY
          createdAt DESC
        LIMIT
          ${perPage * page - perPage}, ${perPage}       
      `,
            values: [tablename_1.default.allowanceTask, { userId }]
        });
        const [total] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          COUNT(*) AS cnt
        FROM
          ??      
        WHERE
          ? AND isDeleted != 1
      `,
            values: [tablename_1.default.allowanceTask, { userId }]
        });
        return { data: rows, total: (total === null || total === void 0 ? void 0 : total.cnt) || 0 };
    }
    async updateAllowanceTask(allowanceTaskId, options, connection) {
        const { affectedRows } = await loaders_1.db.query({
            connection,
            sql: `UPDATE ?? SET ? WHERE ?`,
            values: [tablename_1.default.allowanceTask, Object.assign({}, options), { allowanceTaskId }]
        });
        return affectedRows;
    }
    async deleteAllowanceTask(allowanceTaskId, connection) {
        const { affectedRows } = await loaders_1.db.query({
            connection,
            sql: `UPDATE ?? SET isDeleted = true, deletedAt = now() WHERE ?`,
            values: [tablename_1.default.allowanceTask, { allowanceTaskId }]
        });
        return affectedRows;
    }
    async createAllowanceChat(options, connection) {
        const { insertId } = await loaders_1.db.query({
            connection,
            sql: `INSERT INTO ?? SET ?`,
            values: [tablename_1.default.allowanceChat, Object.assign({}, options)]
        });
        return insertId;
    }
    async findOneAllowanceChat(allowanceChatId, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `SELECT * FROM ?? WHERE ? AND isDeleted != 1`,
            values: [tablename_1.default.allowanceChat, { allowanceChatId }]
        });
        return row;
    }
    async updateAllowanceChat(allowanceChatId, options, connection) {
        const { affectedRows } = await loaders_1.db.query({
            connection,
            sql: `UPDATE ?? SET ? WHERE ?`,
            values: [tablename_1.default.allowanceChat, Object.assign({}, options), { allowanceChatId }]
        });
        return affectedRows;
    }
}
exports.allowanceModel = new AllowanceModel();
