"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userCtrl = void 0;
const userService_1 = require("../../../../services/userService");
class UserCtrl {
    async getUsers(req, res, next) {
        try {
            const { search, order, page, perPage } = req.options;
            const ret = await userService_1.userService.getUsers({ search, order, page, perPage });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async getUser(req, res, next) {
        try {
            const userId = req.options.id;
            const ret = await userService_1.userService.getUser(userId);
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
}
exports.userCtrl = new UserCtrl();
