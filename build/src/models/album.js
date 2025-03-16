"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.albumModel = void 0;
const loaders_1 = require("../loaders");
const tablename_1 = __importDefault(require("./tablename"));
class AlbumModel {
    async createAlbumChat(options, connection) {
        const { insertId } = await loaders_1.db.query({
            connection,
            sql: `INSERT INTO ?? SET ?`,
            values: [tablename_1.default.allowanceAlbum, Object.assign({}, options)]
        });
        return insertId;
    }
    async createAlbumIamge(allowanceAlbumId, albumImage, connection) {
        const { insertId } = await loaders_1.db.query({
            connection,
            sql: `INSERT INTO ?? SET ?`,
            values: [tablename_1.default.allowanceAlbumImage, { allowanceAlbumId, albumImage }]
        });
        return insertId;
    }
    async findOneAlbum(allowanceAlbumId, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          a.*,
          GROUP_CONCAT(ai.albumImage) as albumImages
        FROM
          ?? a
        LEFT JOIN
          ?? ai ON a.allowanceAlbumId = ai.allowanceAlbumId and ai.isDeleted != 1
        WHERE
          a.? AND a.isDeleted != 1`,
            values: [tablename_1.default.allowanceAlbum, tablename_1.default.allowanceAlbumImage, { allowanceAlbumId }]
        });
        return row;
    }
    async updateAlbumChat(allowanceAlbumId, options, connection) {
        const { affectedRows } = await loaders_1.db.query({
            connection,
            sql: `UPDATE ?? SET ? WHERE ?`,
            values: [tablename_1.default.allowanceAlbum, Object.assign({}, options), { allowanceAlbumId }]
        });
        return affectedRows;
    }
}
exports.albumModel = new AlbumModel();
