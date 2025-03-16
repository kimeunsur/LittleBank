"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appVersionCtrl = void 0;
const appVersion_1 = require("../../../../models/appVersion");
class AppVersionCtrl {
    async getVersions(req, res, next) {
        try {
            const result = await appVersion_1.appVersionModel.getVersions();
            res.status(200).json(result);
        }
        catch (e) {
            next(e);
        }
    }
}
exports.appVersionCtrl = new AppVersionCtrl();
