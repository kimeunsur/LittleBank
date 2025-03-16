"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.settlementModel = void 0;
const loaders_1 = require("../loaders");
const tablename_1 = __importDefault(require("./tablename"));
class SettlementModel {
    async createSettlement(options, connection) {
        const { insertId } = await loaders_1.db.query({
            connection,
            sql: `INSERT INTO ?? SET ?`,
            values: [tablename_1.default.allowanceSettlement, Object.assign({}, options)]
        });
        return insertId;
    }
    async findSettlementById(allowanceSettlementId, connection) {
        const [rows] = await loaders_1.db.query({
            connection,
            sql: `SELECT * FROM ?? WHERE ?`,
            values: [tablename_1.default.allowanceSettlement, { allowanceSettlementId }]
        });
        return rows;
    }
    async findAllAllSettlements(options, connection) {
        const { startTime, endTime, order, settlementType, settlementStatus, page, perPage } = options;
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          ast.allowanceSettlementId,
          ast.profileId,
          ast.settlementType,
          ast.settlementStatus,
          ast.settlementAmount,
          (ast.settlementAmount-ast.settlementFee) AS realSettlementAmount,
          ast.settlementFee,
          p.name,
          p.bankName,
          p.bankAccount,
          ast.createdAt
        FROM
          ?? ast
        JOIN
          ?? p ON ast.profileId = p.profileId
        WHERE
          ast.isDeleted != 1
          ${startTime && endTime ? `AND (ast.createdAt BETWEEN '${startTime}' AND '${endTime}')` : ''}
          ${settlementStatus ? `AND (ast.settlementStatus = '${settlementStatus}' )` : ''}
          ${settlementType ? `AND (ast.settlementType = '${settlementType}' )` : ''}
        ORDER BY
          ast.createdAt ${order}  
        LIMIT
          ${perPage * page - perPage}, ${perPage}       
      `,
            values: [tablename_1.default.allowanceSettlement, tablename_1.default.profile]
        });
        const [total] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          COUNT(ast.allowanceSettlementId) AS cnt
        FROM
          ?? ast
        JOIN
          ?? p ON ast.profileId = p.profileId         
        WHERE
          ast.isDeleted != 1
          ${startTime && endTime ? `AND (ast.createdAt BETWEEN '${startTime}' AND '${endTime}')` : ''}
          ${settlementStatus ? `AND (ast.settlementStatus = '${settlementStatus}' )` : ''}
          ${settlementType ? `AND (ast.settlementType = '${settlementType}' )` : ''}
      `,
            values: [tablename_1.default.allowanceSettlement, tablename_1.default.profile]
        });
        return { data: rows, total: (total === null || total === void 0 ? void 0 : total.cnt) || 0 };
    }
    async findAllAllSettlementsMobile(profileId, options, connection) {
        const { page, perPage } = options;
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          ast.allowanceSettlementId,
          ast.profileId,
          ast.settlementType,
          ast.settlementStatus,
          ast.settlementAmount,
          (ast.settlementAmount-ast.settlementFee) AS realSettlementAmount,
          ast.settlementFee,
          p.name,
          p.bankName,
          p.bankAccount,
          ast.createdAt
        FROM
          ?? ast
        JOIN
          ?? p ON ast.profileId = p.profileId
        WHERE
          ast.isDeleted != 1 AND ast.?
        ORDER BY
          ast.createdAt DESC
        LIMIT
          ${perPage * page - perPage}, ${perPage}       
      `,
            values: [tablename_1.default.allowanceSettlement, tablename_1.default.profile, { profileId }]
        });
        const [total] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          COUNT(ast.allowanceSettlementId) AS cnt
        FROM
          ?? ast
        JOIN
          ?? p ON ast.profileId = p.profileId         
        WHERE
          ast.isDeleted != 1 AND ast.?
      `,
            values: [tablename_1.default.allowanceSettlement, tablename_1.default.profile, { profileId }]
        });
        return { data: rows, total: (total === null || total === void 0 ? void 0 : total.cnt) || 0 };
    }
    async updateSettlement(allowanceSettlementId, options, connection) {
        const { affectedRows } = await loaders_1.db.query({
            connection,
            sql: `UPDATE ?? SET ? WHERE ?`,
            values: [tablename_1.default.allowanceSettlement, Object.assign({}, options), { allowanceSettlementId }]
        });
        return affectedRows;
    }
    async getUsersDownload() {
        const rows = await loaders_1.db.query({
            sql: `
        SELECT
          ROW_NUMBER() OVER (ORDER BY ast.allowanceSettlementId) AS '순번',
          p.name,
          p.bankName,
          p.bankAccount,
          ast.settlementType,  
          ast.settlementStatus,
          ast.settlementAmount,
          ast.createdAt
        FROM
          ?? as ast
        JOIN
          ?? as p ON ast.profileId = p.profileId
        WHERE
          p.isDeleted != 1 AND ast.isDeleted != 1 AND ast.settlementStatus = 'pending'
          AND ast.settlementType = 'manual'
      `,
            values: [tablename_1.default.allowanceSettlement, tablename_1.default.profile]
        });
        return { data: rows };
    }
}
exports.settlementModel = new SettlementModel();
