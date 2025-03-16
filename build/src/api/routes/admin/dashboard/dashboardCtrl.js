"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardCtrl = void 0;
const dashboardService_1 = require("../../../../services/dashboardService");
class DashboardCtrl {
    async getDash(req, res, next) {
        try {
            const date = req.options.param;
            const ret = await dashboardService_1.dashboardService.getDash(date);
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async getBalance(req, res, next) {
        try {
            const ret = await dashboardService_1.dashboardService.getBalance();
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
}
exports.dashboardCtrl = new DashboardCtrl();
