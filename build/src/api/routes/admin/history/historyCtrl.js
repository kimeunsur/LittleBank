"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyCtrl = void 0;
const historyService_1 = require("../../../../services/historyService");
const settlementService_1 = require("../../../../services/settlementService");
const paymentService_1 = require("../../../../services/paymentService");
class HistoryCtrl {
    async getPaymentHistories(req, res, next) {
        try {
            const { search, startTime, endTime, order, page, perPage } = req.options;
            const ret = await paymentService_1.paymentService.getPaymentHistories({ search, startTime, endTime, order, page, perPage });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async getSettlementHistories(req, res, next) {
        try {
            const { startTime, endTime, order, settlementType, settlementStatus, page, perPage } = req.options;
            const ret = await settlementService_1.settlementService.getSettlementHistories({ startTime, endTime, order, settlementType, settlementStatus, page, perPage });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async putSettlementComplete(req, res, next) {
        try {
            const allowanceSettlementId = req.options.id;
            await settlementService_1.settlementService.putSettlementComplete(allowanceSettlementId);
            res.status(200).send('success');
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async getAllowanceHistoriesAdmin(req, res, next) {
        try {
            const { startTime, endTime, order, page, perPage } = req.options;
            const ret = await historyService_1.historyService.getAllowanceHistoriesAdmin({ startTime, endTime, order, page, perPage });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async getAllowanceAlbumHistoriesAdmin(req, res, next) {
        try {
            const { startTime, endTime, order, page, perPage } = req.options;
            const ret = await historyService_1.historyService.getAllowanceAlbumHistoriesAdmin({ startTime, endTime, order, page, perPage });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async getSettlementUsersDownload(req, res, next) {
        try {
            const ret = await settlementService_1.settlementService.getSettlementUsersDownload();
            res.setHeader('Content-Disposition', `attachment; filename=${ret.fileName}.xlsx`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.status(200).send(ret.excelBuffer);
        }
        catch (e) {
            next(e);
        }
    }
}
exports.historyCtrl = new HistoryCtrl();
