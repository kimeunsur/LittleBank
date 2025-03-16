"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardModel = void 0;
const loaders_1 = require("../loaders");
const tablename_1 = __importDefault(require("./tablename"));
class DashboardModel {
    async findDash(date, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          p.profileId,
          COALESCE(SUM(fp.totalAmount), 0) AS totalPayment,
          COALESCE(SUM(fp.monthAmount), 0) AS monthPayment,
          COALESCE(SUM(fp.totalPaymentFee), 0) AS totalPaymentFee,
          COALESCE(SUM(fp.monthPaymentFee), 0) AS monthPaymentFee,
          COALESCE(SUM(fs.totalSettlement), 0) AS totalSettlement,
          COALESCE(SUM(fs.monthSettlement), 0) AS monthSettlement,
          COALESCE(SUM(fs.totalSettlementFee), 0) AS totalSettlementFee,
          COALESCE(SUM(fs.monthSettlementFee), 0) AS monthSettlementFee,
          COALESCE(SUM(fa.totalAlbumAmount), 0) AS totalAlbumAmount,
          COALESCE(SUM(fa.monthAlbumAmount), 0) AS monthAlbumAmount,
          COALESCE(SUM(fa.totalAlbumAmountFee), 0) AS totalAlbumAmountFee,
          COALESCE(SUM(fa.monthAlbumFee), 0) AS monthAlbumAmountFee,
          COALESCE(SUM(p.parentAmount), 0) AS totalParentPoint,
          COALESCE(SUM(p.childAmount), 0) AS totalChildPoint
        FROM
            ?? p
        LEFT JOIN (
            SELECT 
                pm.profileId, 
                SUM(pm.amount) AS totalAmount,
                SUM(CASE WHEN DATE_FORMAT(pm.createdAt, '%Y-%m') = '${date}' THEN pm.amount ELSE 0 END) AS monthAmount,
                SUM(pm.paymentFee) AS totalPaymentFee,
                SUM(CASE WHEN DATE_FORMAT(pm.createdAt, '%Y-%m') = '${date}' THEN pm.paymentFee ELSE 0 END) AS monthPaymentFee
            FROM ?? pm
            WHERE pm.isDeleted != 1 AND pm.paymentStatus = 'paid'          
        ) fp ON p.profileId = fp.profileId
        LEFT JOIN (
            SELECT 
                ast.profileId, 
                SUM(ast.settlementAmount) AS totalSettlement,
                SUM(CASE WHEN DATE_FORMAT(ast.createdAt, '%Y-%m') = '${date}' THEN ast.settlementAmount ELSE 0 END) AS monthSettlement,
                SUM(ast.settlementFee) AS totalSettlementFee,
                SUM(CASE WHEN DATE_FORMAT(ast.createdAt, '%Y-%m') = '${date}' THEN ast.settlementFee ELSE 0 END) AS monthSettlementFee
            FROM ?? ast
            WHERE ast.isDeleted != 1 AND ast.settlementStatus = 'complete'          
        ) fs ON p.profileId = fs.profileId
        LEFT JOIN (
            SELECT 
                ab.profileId, 
                SUM(ab.albumAmount) AS totalAlbumAmount,
                SUM(CASE WHEN DATE_FORMAT(ab.createdAt, '%Y-%m') = '${date}' THEN ab.albumAmount ELSE 0 END) AS monthAlbumAmount,
                SUM(ab.albumFee) AS totalAlbumAmountFee,
                SUM(CASE WHEN DATE_FORMAT(ab.createdAt, '%Y-%m') = '${date}' THEN ab.albumFee ELSE 0 END) AS monthAlbumFee
            FROM ?? ab
            WHERE ab.isDeleted != 1 AND ab.albumStatus = 'complete'          
        ) fa ON p.profileId = fa.profileId
        WHERE
            p.isDeleted != 1     
      `,
            values: [tablename_1.default.profile, tablename_1.default.payment, tablename_1.default.allowanceSettlement, tablename_1.default.allowanceAlbum]
        });
        return row;
    }
    async findDashManual(connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          COALESCE(SUM(CASE WHEN ast.settlementStatus = 'pending' AND settlementType = 'manual' THEN ast.settlementAmount ELSE 0 END), 0) AS manualSettlementAmount,
          COUNT(CASE WHEN ast.settlementStatus = 'pending' AND settlementType = 'manual' THEN 1 END) AS manualSettlementCount 
        FROM
          ?? p     
        LEFT JOIN
          ?? ast ON p.profileId = ast.profileId AND ast.isDeleted != 1 AND ast.settlementStatus = 'pending'
        WHERE
          p.isDeleted != 1       
      `,
            values: [tablename_1.default.profile, tablename_1.default.allowanceSettlement]
        });
        return row;
    }
}
exports.dashboardModel = new DashboardModel();
