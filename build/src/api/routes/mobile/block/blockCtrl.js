"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockCtrl = void 0;
const blockService_1 = require("../../../../services/blockService");
const loaders_1 = require("../../../../loaders");
class BlockCtrl {
    async postBlock(req, res, next) {
        const connection = await loaders_1.db.beginTransaction();
        try {
            const profileId = req.profileId;
            const { blockProfileId } = req.options;
            await blockService_1.blockService.postBlock(profileId, blockProfileId, connection);
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
    async getBlocksUsingPaging(req, res, next) {
        try {
            const profileId = req.profileId;
            const { page, perPage } = req.options;
            const ret = await blockService_1.blockService.getBlocksUsingPaging(profileId, { page, perPage });
            res.status(200).json(ret);
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
    async deleteBlock(req, res, next) {
        try {
            const profileId = req.profileId;
            const { id: blockProfileId } = req.options;
            await blockService_1.blockService.deleteBlock(profileId, blockProfileId);
            res.status(200).send('success');
        }
        catch (e) {
            e.status = 477;
            next(e);
        }
    }
}
exports.blockCtrl = new BlockCtrl();
