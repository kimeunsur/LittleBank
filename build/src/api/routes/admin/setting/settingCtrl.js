"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingCtrl = void 0;
const adminService_1 = require("../../../../services/adminService");
class SettingCtrl {
    async getSetting(req, res, next) {
        try {
            const ret = await adminService_1.adminService.getSetting();
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async putSetting(req, res, next) {
        try {
            const adminSettingId = req.options.id;
            const { pointFee, depositFee, depositFeeMin, sellingFee, sellingFeeMin, url } = req.options;
            await adminService_1.adminService.putSetting(adminSettingId, { pointFee, depositFee, depositFeeMin, sellingFee, sellingFeeMin, url });
            res.status(200).send('success');
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
}
exports.settingCtrl = new SettingCtrl();
