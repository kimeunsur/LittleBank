"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportModel = void 0;
const loaders_1 = require("../loaders");
const tablename_1 = __importDefault(require("./tablename"));
class ReportModel {
    async createReport(profileId, reportProfileId, reportReason, connection) {
        await loaders_1.db.query({
            connection,
            sql: `
        INSERT INTO ??
        SET profileId = ?,
            reportProfileId = ?,
            reportReason = ?
      `,
            values: [tablename_1.default.report, profileId, reportProfileId, reportReason]
        });
    }
    async findAllReports(profileId, { page, perPage }) {
        const data = await loaders_1.db.query({
            sql: `
        SELECT 
          r.*,
          p.profileImage as reportProfileImage
        FROM ?? r
        INNER JOIN ?? p ON r.reportProfileId = p.profileId
        WHERE r.profileId = ?
          and r.isDeleted != 1
        ORDER BY
          r.createdAt DESC
        LIMIT
          ${perPage * page - perPage}, ${perPage}       
      `,
            values: [tablename_1.default.report, tablename_1.default.profile, profileId]
        });
        return { data, total: (data === null || data === void 0 ? void 0 : data.length) | 0 };
    }
    async deleteReport(profileId, reportProfileId, connection) {
        await loaders_1.db.query({
            connection,
            sql: `
        UPDATE ??
        SET isDeleted = 1
        WHERE profileId = ?
          and reportProfileId = ?
          and isDeleted != 1
      `,
            values: [tablename_1.default.report, profileId, reportProfileId]
        });
    }
}
exports.reportModel = new ReportModel();
