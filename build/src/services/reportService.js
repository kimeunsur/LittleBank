"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = void 0;
const report_1 = require("../models/report");
const profileService_1 = require("./profileService");
class ReportService {
    async postReport(profileId, reportProfileId, reportReason, connection) {
        if (profileId === reportProfileId) {
            throw new Error('자기 자신을 신고할 수 없습니다');
        }
        const reportProfile = await profileService_1.profileService.getProfileInfo(reportProfileId, connection);
        if (!reportProfile) {
            throw new Error('존재하지 않는 프로필입니다');
        }
        await report_1.reportModel.createReport(profileId, reportProfileId, reportReason, connection);
    }
    async getReports(profileId, { page, perPage }) {
        return await report_1.reportModel.findAllReports(profileId, { page, perPage });
    }
    async deleteReport(profileId, reportProfileId, connection) {
        await report_1.reportModel.deleteReport(profileId, reportProfileId, connection);
    }
}
exports.reportService = new ReportService();
