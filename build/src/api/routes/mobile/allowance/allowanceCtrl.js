"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowanceCtrl = void 0;
const allowanceService_1 = require("../../../../services/allowanceService");
const loaders_1 = require("../../../../loaders");
class AllowanceCtrl {
    async postAllowanceTask(req, res, next) {
        try {
            const profileId = req.profileId;
            const { taskContent, taskAmount } = req.options;
            await allowanceService_1.allowanceService.postAllowanceTask(profileId, { taskContent, taskAmount });
            res.status(200).send('success');
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async getAllowanceTasks(req, res, next) {
        try {
            const profileId = req.profileId;
            const { page, perPage } = req.options;
            const ret = await allowanceService_1.allowanceService.getAllowanceTasks(profileId, { page, perPage });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async putAllowanceTask(req, res, next) {
        try {
            const profileId = req.profileId;
            const allowanceTaskId = req.options.id;
            const { taskContent, taskAmount } = req.options;
            await allowanceService_1.allowanceService.putAllowanceTask(profileId, allowanceTaskId, { taskContent, taskAmount });
            res.status(200).send('success');
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async deleteAllowanceTask(req, res, next) {
        try {
            const profileId = req.profileId;
            const allowanceTaskId = req.options.id;
            await allowanceService_1.allowanceService.deleteAllowanceTask(profileId, allowanceTaskId);
            res.status(200).send('success');
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async postAllowanceChat(req, res, next) {
        const connection = await loaders_1.db.beginTransaction();
        try {
            const profileId = req.profileId;
            const { chatRoomId, allowanceTaskId, allowanceChat, allowanceChatImage } = req.options;
            await allowanceService_1.allowanceService.postAllowanceChat(chatRoomId, allowanceTaskId, { profileId, allowanceChat, allowanceChatImage }, connection);
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
    async getAllowanceChat(req, res, next) {
        try {
            const allowanceChatId = req.options.id;
            const ret = await allowanceService_1.allowanceService.getAllowanceChat(allowanceChatId);
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async putAllowanceChatComplete(req, res, next) {
        const connection = await loaders_1.db.beginTransaction();
        try {
            const profileId = req.profileId;
            const allowanceChatId = req.options.id;
            await allowanceService_1.allowanceService.putAllowanceChatComplete(profileId, allowanceChatId, connection);
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
exports.allowanceCtrl = new AllowanceCtrl();
