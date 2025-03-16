"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testCtrl = void 0;
const settlementService_1 = require("../../../../services/settlementService");
class TestCtrl {
    async testt(req, res, next) {
        try {
            // const imp_uid = 'imp_810772926531'
            // const imp_uid = 'imp_401932948909'
            // const dd = await iamportManager.getCertifications({imp_uid})
            const ret = await settlementService_1.settlementService.getBankTransferBalance(1);
            res.status(200).json(ret);
            // res.status(200).send('success')
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
}
exports.testCtrl = new TestCtrl();
