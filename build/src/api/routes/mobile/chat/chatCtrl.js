"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatCtrl = void 0;
const chatService_1 = require("../../../../services/chatService");
const loaders_1 = require("../../../../loaders");
class ChatCtrl {
    async getDirectChatRoom(req, res, next) {
        const connection = await loaders_1.db.beginTransaction();
        try {
            const profileId = req.profileId;
            let { id: targetProfileId, page, perPage } = req.options;
            const ret = await chatService_1.chatService.getDirectChatRoom(profileId, targetProfileId, { page, perPage }, connection);
            await loaders_1.db.commit(connection);
            res.status(200).json(ret);
        }
        catch (e) {
            if (connection) {
                await loaders_1.db.rollback(connection);
            }
            e.status = 477;
            next(e);
        }
    }
    async getFamilies(req, res, next) {
        try {
            const profileId = req.profileId;
            let { page, perPage } = req.options;
            const ret = await chatService_1.chatService.getFamilies(profileId, { page, perPage });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async getChatMessages(req, res, next) {
        try {
            const profileId = req.profileId;
            const { id: chatRoomId, page, perPage } = req.options;
            const ret = await chatService_1.chatService.getChatMessages(profileId, chatRoomId, { page, perPage });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
}
exports.chatCtrl = new ChatCtrl();
