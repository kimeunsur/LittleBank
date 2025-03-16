"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buddyCtrl = void 0;
const buddyService_1 = require("../../../../services/buddyService");
const loaders_1 = require("../../../../loaders");
class BuddyCtrl {
    async postBuddy(req, res, next) {
        const connection = await loaders_1.db.beginTransaction();
        try {
            const profileId = req.profileId;
            const { buddyProfileId, buddyNameMy, buddyNameYou } = req.options;
            await buddyService_1.buddyService.postBuddy(profileId, buddyProfileId, buddyNameMy, buddyNameYou, connection);
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
    async getBuddies(req, res, next) {
        try {
            const profileId = req.profileId;
            const { page, perPage } = req.options;
            const ret = await buddyService_1.buddyService.getBuddies(profileId, { page, perPage });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async getBuddySearch(req, res, next) {
        try {
            const profileId = req.profileId;
            const { email, page, perPage } = req.options;
            const ret = await buddyService_1.buddyService.getBuddySearch(profileId, { email, page, perPage });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    /**
     * 친구들의 미션/용돈 이체완료 피드 조회
     * @param req
     * @param res
     * @param next
     */
    async getBuddiesNews(req, res, next) {
        try {
            const profileId = req.profileId;
            const { page, perPage } = req.options;
            const ret = await buddyService_1.buddyService.getBuddiesNews(profileId, { page, perPage });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async putBuddy(req, res, next) {
        try {
            const profileId = req.profileId;
            const buddyProfileId = req.options.id;
            const { buddyName } = req.options;
            await buddyService_1.buddyService.putBuddy(profileId, buddyProfileId, buddyName);
            res.status(200).send('success');
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async deleteBuddy(req, res, next) {
        const connection = await loaders_1.db.beginTransaction();
        try {
            const profileId = req.profileId;
            const buddyProfileId = req.options.id;
            await buddyService_1.buddyService.deleteBuddy(profileId, buddyProfileId, connection);
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
}
exports.buddyCtrl = new BuddyCtrl();
