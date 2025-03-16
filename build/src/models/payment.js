"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentModel = void 0;
const loaders_1 = require("../loaders");
const tablename_1 = __importDefault(require("./tablename"));
class PaymentModel {
    async postPayment(options, connection) {
        const { insertId } = await loaders_1.db.query({
            connection,
            sql: `INSERT INTO ?? SET ?`,
            values: [tablename_1.default.payment, Object.assign({}, options)]
        });
        return insertId;
    }
    async findOnePayment(paymentId, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `SELECT * FROM ?? WHERE ? AND isDeleted != 1`,
            values: [tablename_1.default.payment, { paymentId }]
        });
        return row;
    }
    async updatePayment(paymentId, options, connection) {
        const { affectedRows } = await loaders_1.db.query({
            connection,
            sql: `UPDATE ?? SET ? WHERE ?`,
            values: [tablename_1.default.payment, Object.assign({}, options), { paymentId }]
        });
        return affectedRows;
    }
    async findAllAllPayments(profileId, options, connection) {
        const { page, perPage } = options;
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          *         
        FROM
          ??                
        WHERE
          ? AND isDeleted != 1 AND paymentStatus != 'pending'
        ORDER BY
          createdAt DESC
        LIMIT
          ${perPage * page - perPage}, ${perPage}       
      `,
            values: [tablename_1.default.payment, { profileId }]
        });
        const [total] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          COUNT(*) AS cnt
        FROM
          ??      
        WHERE
          ? AND isDeleted != 1 AND paymentStatus != 'pending'
      `,
            values: [tablename_1.default.payment, { profileId }]
        });
        return { data: rows, total: (total === null || total === void 0 ? void 0 : total.cnt) || 0 };
    }
    async findAllPaymentHistories(options, connection) {
        const { search, startTime, endTime, order, page, perPage } = options;
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          pm.paymentId,
          u.email,
          u.userId,
          p.name,
          p.profileId,
          pm.amount,
         (pm.amount - pm.paymentFee) AS realAmount,
          pm.paymentFee,
          pm.paymentStatus,
          pm.createdAt
        FROM
          ?? pm
        JOIN
          ?? p ON p.profileId = pm.profileId
        JOIN
          ?? u ON u.userId = p.userId
        WHERE
          pm.isDeleted != 1 AND pm.paymentStatus != 'pending'
          ${search ? `AND (u.email LIKE '%${search}%' OR u.phone LIKE '%${search}%')` : ''}
          ${startTime && endTime ? `AND (pm.createdAt BETWEEN '${startTime}' AND '${endTime}')` : ''}          
        ORDER BY
          pm.createdAt ${order}
        LIMIT
          ${perPage * page - perPage}, ${perPage}
      `,
            values: [tablename_1.default.payment, tablename_1.default.profile, tablename_1.default.user]
        });
        const [total] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          COUNT(pm.paymentId) AS cnt           
        FROM
          ?? pm
        JOIN
          ?? p ON p.profileId = pm.profileId
        JOIN
          ?? u ON u.userId = p.userId
        WHERE
          pm.isDeleted != 1 AND pm.paymentStatus != 'pending'
          ${search ? `AND (u.email LIKE '%${search}%' OR u.phone LIKE '%${search}%')` : ''}
          ${startTime && endTime ? `AND (pm.createdAt BETWEEN '${startTime}' AND '${endTime}')` : ''}         
      `,
            values: [tablename_1.default.payment, tablename_1.default.profile, tablename_1.default.user]
        });
        return { data: rows, total: (total === null || total === void 0 ? void 0 : total.cnt) || 0 };
    }
}
exports.paymentModel = new PaymentModel();
