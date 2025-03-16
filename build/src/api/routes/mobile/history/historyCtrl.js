"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyCtrl = void 0;
const historyService_1 = require("../../../../services/historyService");
class HistoryCtrl {
    async getAllowanceHistoriesChild(req, res, next) {
        try {
            const profileId = req.profileId;
            const { date, page, perPage } = req.options;
            const ret = await historyService_1.historyService.getAllowanceHistories(profileId, { date, page, perPage });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async getAllowanceHistoriesParent(req, res, next) {
        try {
            const profileId = req.options.id;
            const { date, page, perPage } = req.options;
            const ret = await historyService_1.historyService.getAllowanceHistories(profileId, { date, page, perPage });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async getAllowanceHistoriesParentList(req, res, next) {
        try {
            const profileId = req.profileId;
            // const {page, perPage} = req.options
            const { date, page, perPage } = req.options;
            const ret = await historyService_1.historyService.getAllowanceHistoriesParentList(profileId, { date, page, perPage });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
}
exports.historyCtrl = new HistoryCtrl();
