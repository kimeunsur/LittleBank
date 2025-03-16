"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const profile_1 = require("../models/profile");
class UserService {
    async getUsers(options, connection) {
        const ret = await profile_1.profileModel.findAllProfilesForAdmin(options);
        return ret;
    }
    async getUser(userId, connection) {
        const ret = await profile_1.profileModel.findFamilyForAdmin(userId);
        return ret;
    }
}
exports.userService = new UserService();
