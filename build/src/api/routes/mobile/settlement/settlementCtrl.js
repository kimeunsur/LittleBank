"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settlementCtrl = void 0;
const settlementService_1 = require("../../../../services/settlementService");
const loaders_1 = require("../../../../loaders");
class SettlementCtrl {
    async postSettlement(req, res, next) {
        const connection = await loaders_1.db.beginTransaction();
        try {
            const profileId = req.profileId;
            const { settlementType, settlementAmount } = req.options;
            await settlementService_1.settlementService.postSettlement(profileId, { settlementType, settlementAmount }, connection);
            await loaders_1.db.commit(connection);
            res.status(200).send('success');
        }
        catch (e) {
            if (connection)
                await loaders_1.db.rollback(connection);
            e.status = 477;
            next(e);
        }
    }
    async getSettlements(req, res, next) {
        try {
            const profileId = req.profileId;
            const { page, perPage } = req.options;
            const ret = await settlementService_1.settlementService.getSettlementsMobile(profileId, { page, perPage });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
}
exports.settlementCtrl = new SettlementCtrl();
