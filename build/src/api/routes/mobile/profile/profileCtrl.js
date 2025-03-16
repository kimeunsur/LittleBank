"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileCtrl = void 0;
const profileService_1 = require("../../../../services/profileService");
class ProfileCtrl {
    async getProfileInfo(req, res, next) {
        try {
            const profileId = req.profileId;
            const options = req.options;
            const ret = await profileService_1.profileService.getProfileInfo(profileId);
            await profileService_1.profileService.putProfileInfo(profileId, options);
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async putProfileInfo(req, res, next) {
        try {
            const profileId = req.profileId;
            const { profilePass, profileImage, name, bankCode, bankName, bankAccount } = req.options;
            await profileService_1.profileService.putProfileInfo(profileId, { profilePass, profileImage, name, bankCode, bankName, bankAccount });
            res.status(200).send('success');
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async getProfileSetting(req, res, next) {
        try {
            const profileId = req.profileId;
            const ret = await profileService_1.profileService.getProfileSetting(profileId);
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async putProfileSetting(req, res, next) {
        try {
            const profileId = req.profileId;
            const { familyAlarm, friendAlarm, autoFriend } = req.options;
            await profileService_1.profileService.putProfileSetting(profileId, { familyAlarm, friendAlarm, autoFriend });
            res.status(200).send('success');
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async deleteProfile(req, res, next) {
        try {
            const profileId = req.profileId;
            await profileService_1.profileService.deleteProfile(profileId);
            res.status(200).send('success');
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
}
exports.profileCtrl = new ProfileCtrl();
