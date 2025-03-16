"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = void 0;
const dashboard_1 = require("../models/dashboard");
const settlementService_1 = require("./settlementService");
class DashboardService {
    async getDash(date) {
        const ret = await dashboard_1.dashboardModel.findDash(date);
        const manual = await dashboard_1.dashboardModel.findDashManual();
        ret.manualSettlementAmount = manual.manualSettlementAmount;
        ret.manualSettlementCount = manual.manualSettlementCount;
        return ret;
    }
    async getBalance() {
        const ret = await settlementService_1.settlementService.getBankTransferBalance(1);
        return ret;
    }
}
exports.dashboardService = new DashboardService();
