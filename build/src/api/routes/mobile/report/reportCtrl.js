"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportCtrl = void 0;
const loaders_1 = require("../../../../loaders");
const reportService_1 = require("../../../../services/reportService");
class ReportCtrl {
    async postReport(req, res, next) {
        const connection = await loaders_1.db.beginTransaction();
        try {
            const profileId = req.profileId;
            const { reportProfileId, reportReason } = req.options;
            await reportService_1.reportService.postReport(profileId, reportProfileId, reportReason, connection);
            await loaders_1.db.commit(connection);
            res.status(200).send('success');
        }
        catch (e) {
            if (connection) {
                await loaders_1.db.rollback(connection);
            }
            e.status = 477;
            next(e);
        }
    }
    async getReports(req, res, next) {
        try {
            const profileId = req.profileId;
            const { page, perPage } = req.options;
            const ret = await reportService_1.reportService.getReports(profileId, { page, perPage });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async deleteReport(req, res, next) {
        try {
            const profileId = req.profileId;
            const reportProfileId = req.options.id;
            await reportService_1.reportService.deleteReport(profileId, reportProfileId);
            res.status(200).send('success');
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
}
exports.reportCtrl = new ReportCtrl();
