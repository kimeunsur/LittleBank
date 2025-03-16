"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authCtrl = void 0;
const adminService_1 = require("../../../../services/adminService");
class AuthCtrl {
    async getAuth(req, res, next) {
        try {
            await adminService_1.adminService.findOneAdminById(req.session.adminId);
            res.status(200).send('success');
        }
        catch (e) {
            e.status = 498;
            next(e);
        }
    }
    async postAdmin(req, res, next) {
        try {
            const { adminName, email, password } = req.options;
            await adminService_1.adminService.postAdmin({ adminName, email, password });
            res.status(200).send('success');
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async postAuth(req, res, next) {
        try {
            const { email, password } = req.options;
            const ret = await adminService_1.adminService.postAuth({ email, password });
            req.session.adminId = ret.adminId;
            req.session.type = 'admin';
            req.session.clientIp = req.clientIp;
            req.session.useragent = req.headers['user-agent'];
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async deleteAuth(req, res, next) {
        try {
            if (req.session) {
                req.session.destroy((e) => res.status(200).send('success'));
            }
            else
                res.status(200).send('success');
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
}
exports.authCtrl = new AuthCtrl();
