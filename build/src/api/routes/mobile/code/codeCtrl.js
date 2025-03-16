"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeCtrl = void 0;
const codeService_1 = require("../../../../services/codeService");
class CodeCtrl {
    async getCodeBank(req, res, next) {
        try {
            const ret = await codeService_1.codeService.getCodeBank();
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
}
exports.codeCtrl = new CodeCtrl();
