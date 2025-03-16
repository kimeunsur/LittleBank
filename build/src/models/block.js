"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockModel = void 0;
const loaders_1 = require("../loaders");
const tablename_1 = __importDefault(require("./tablename"));
class BlockModel {
    async createBlock(profileId, blockProfileId, connection) {
        const { insertId } = await loaders_1.db.query({
            connection,
            sql: `
        INSERT INTO ??
        SET ?
      `,
            values: [tablename_1.default.block, { profileId, blockProfileId }]
        });
        return insertId;
    }
    async findAllBlocksUsingPaging(profileId, options, connection) {
        const { page, perPage } = options;
        const data = await loaders_1.db.query({
            connection,
            sql: `
        SELECT 
          b.*,
          p.profileImage as blockProfileImage
        FROM ?? b
        INNER JOIN ?? p ON b.blockProfileId = p.profileId
        WHERE b.profileId = ?
          and b.isDeleted != 1
        ORDER BY
          b.createdAt DESC
        LIMIT
          ${perPage * page - perPage}, ${perPage}       
      `,
            values: [tablename_1.default.block, tablename_1.default.profile, profileId]
        });
        return { data, total: (data === null || data === void 0 ? void 0 : data.length) || 0 };
    }
    async findBlocksThatBlockedByMe(profileId, connection) {
        return await loaders_1.db.query({
            connection,
            sql: `
        SELECT 
          *
        FROM ??
        WHERE ?
          and isDeleted != 1
        ORDER BY
          createdAt DESC
      `,
            values: [tablename_1.default.block, { profileId }]
        });
    }
    async findAllBlocksThatBlockMe(blockProfileId, connection) {
        return await loaders_1.db.query({
            connection,
            sql: `
        SELECT 
          *
        FROM ??
        WHERE
          blockProfileId = ?
          and isDeleted != 1
        ORDER BY
          createdAt DESC
      `,
            values: [tablename_1.default.block, blockProfileId]
        });
    }
    async findOneBlock(profileId, blockProfileId, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT 
          *
        FROM ??
        WHERE ?
          and ?
          and isDeleted != 1
        ORDER BY
          createdAt DESC
      `,
            values: [tablename_1.default.block, { profileId }, { blockProfileId }]
        });
        return row;
    }
    async deleteBlock(profileId, blockProfileId, connection) {
        return await loaders_1.db.query({
            connection,
            sql: `
        UPDATE ??
        SET isDeleted = 1,
            deletedAt = NOW()
        WHERE ?
          and ?
          and isDeleted != 1
      `,
            values: [tablename_1.default.block, { profileId }, { blockProfileId }]
        });
    }
}
exports.blockModel = new BlockModel();
