"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const admin_1 = require("../models/admin");
const setting_1 = require("../models/setting");
class AdminService {
    async findOneAdminById(adminId) {
        const ret = await admin_1.adminModel.findOneAdminById(adminId);
        if (!ret)
            throw new Error('다시 로그인 해주세요.');
        return ret;
    }
    async postAdmin(options) {
        const check = await admin_1.adminModel.findOneAdminByEmail(options.email);
        if (check)
            throw new Error('이미 존재하는 아이디 입니다.');
        const ret = await admin_1.adminModel.createAdmin(options);
        if (!ret)
            throw new Error('관리자 생성에 실패하였습니다.');
        return ret;
    }
    async postAuth(options) {
        const ret = await admin_1.adminModel.findOneAdminByEmail(options.email);
        if (!ret)
            throw new Error('로그인 정보가 올바르지 않습니다.');
        if (ret.password !== options.password) {
            throw new Error('로그인 정보가 올바르지 않습니다.');
        }
        return ret;
    }
    async getSetting(connection) {
        const ret = await setting_1.settingModel.findAdminSetting(connection);
        if (!ret) {
            throw new Error('설정 정보를 불러오는데 실패하였습니다.');
        }
        return ret;
    }
    async putSetting(adminSettingId, options, connection) {
        options = Object.fromEntries(Object.entries(options).filter(([_, value]) => value != null));
        const ret = await setting_1.settingModel.updateAdminSetting(adminSettingId, options);
        if (!ret) {
            throw new Error('수정에 실패하였습니다.');
        }
        return ret;
    }
}
exports.adminService = new AdminService();
