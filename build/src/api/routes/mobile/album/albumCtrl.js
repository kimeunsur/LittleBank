"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.albumCtrl = void 0;
const albumService_1 = require("../../../../services/albumService");
const loaders_1 = require("../../../../loaders");
class AlbumCtrl {
    async postAlbumChat(req, res, next) {
        const connection = await loaders_1.db.beginTransaction();
        try {
            const profileId = req.profileId;
            const { chatRoomId, albumChat, albumAmount, albumImages } = req.options;
            await albumService_1.albumService.postAlbumChat(chatRoomId, { profileId, albumChat, albumAmount }, albumImages, connection);
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
    async getAlbumChat(req, res, next) {
        try {
            const allowanceAlbumId = req.options.id;
            const ret = await albumService_1.albumService.getAlbumChat(allowanceAlbumId);
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async putAlbumChatComplete(req, res, next) {
        const connection = await loaders_1.db.beginTransaction();
        try {
            const profileId = req.profileId;
            const allowanceAlbumId = req.options.id;
            await albumService_1.albumService.putAlbumChatComplete(profileId, allowanceAlbumId, connection);
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
exports.albumCtrl = new AlbumCtrl();
