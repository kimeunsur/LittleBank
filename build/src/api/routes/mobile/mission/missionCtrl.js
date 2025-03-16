"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missionCtrl = void 0;
const missionService_1 = require("../../../../services/missionService");
const loaders_1 = require("../../../../loaders");
class MissionCtrl {
    async postMissionChat(req, res, next) {
        const connection = await loaders_1.db.beginTransaction();
        try {
            const profileId = req.profileId;
            const { chatRoomId, missionChat, missionAmount, missionStartDate, missionEndDate, missionParentComment, missionParentImage } = req.options;
            await missionService_1.missionService.postMissionChat(profileId, chatRoomId, { missionChat, missionAmount, missionStartDate, missionEndDate, missionParentComment, missionParentImage });
            await loaders_1.db.commit(connection);
            res.status(200).send('success');
        }
        catch (e) {
            if (connection) {
                await loaders_1.db.rollback(connection);
            }
            e.status = 477;
            next(e);
        }
    }
    async getMissionChat(req, res, next) {
        try {
            const allowanceMissionId = req.options.id;
            const profileId = req.profileId;
            const ret = await missionService_1.missionService.getMissionChat(allowanceMissionId, profileId);
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async putMissionChat(req, res, next) {
        try {
            const profileId = req.profileId;
            const allowanceMissionId = req.options.id;
            const { missionChat, missionAmount, missionStartDate, missionEndDate, missionParentComment, missionParentImage } = req.options;
            await missionService_1.missionService.putMissionChat(profileId, allowanceMissionId, { missionChat, missionAmount, missionStartDate, missionEndDate, missionParentComment, missionParentImage });
            res.status(200).send('success');
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async putMissionChatRequest(req, res, next) {
        const connection = await loaders_1.db.beginTransaction();
        try {
            const profileId = req.profileId;
            const allowanceMissionId = req.options.id;
            await missionService_1.missionService.putMissionChatRequest(profileId, allowanceMissionId, connection);
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
    async putMissionChatAssign(req, res, next) {
        const connection = await loaders_1.db.beginTransaction();
        try {
            const profileId = req.profileId;
            const allowanceMissionId = req.options.id;
            await missionService_1.missionService.putMissionChatAssign(profileId, allowanceMissionId, connection);
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
    async putMissionChatChildComplete(req, res, next) {
        const connection = await loaders_1.db.beginTransaction();
        try {
            const profileId = req.profileId;
            const allowanceMissionId = req.options.id;
            const { missionChildComment, missionChildImage } = req.options;
            await missionService_1.missionService.putMissionChatChildComplete(profileId, allowanceMissionId, { missionChildComment, missionChildImage }, connection);
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
    async putMissionChatComplete(req, res, next) {
        const connection = await loaders_1.db.beginTransaction();
        try {
            const profileId = req.profileId;
            const allowanceMissionId = req.options.id;
            await missionService_1.missionService.putMissionChatComplete(profileId, allowanceMissionId, connection);
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
    async deleteMissionChat(req, res, next) {
        try {
            const profileId = req.profileId;
            const allowanceMissionId = req.options.id;
            await missionService_1.missionService.deleteMissionChat(profileId, allowanceMissionId);
            res.status(200).send('success');
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
}
exports.missionCtrl = new MissionCtrl();
