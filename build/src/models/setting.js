"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingModel = void 0;
const loaders_1 = require("../loaders");
const tablename_1 = __importDefault(require("./tablename"));
class SettingModel {
    async createSetting(profileId, connection) {
        const { insertId } = await loaders_1.db.query({
            connection,
            sql: `INSERT INTO ?? SET ?`,
            values: [tablename_1.default.userSetting, { profileId }]
        });
        return insertId;
    }
    async findOneProfileSetting(profileId, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          *
        FROM
          ??       
        WHERE
          ? AND isDeleted != 1
      `,
            values: [tablename_1.default.userSetting, { profileId }]
        });
        return row;
    }
    async updateProfileSetting(profileId, options, connection) {
        const { affectedRows } = await loaders_1.db.query({
            connection,
            sql: `
          UPDATE ?? SET ? WHERE ?
        `,
            values: [tablename_1.default.userSetting, Object.assign({}, options), { profileId }]
        });
        return affectedRows;
    }
    async findAdminSetting(connection) {
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          *
        FROM
          ??       
        WHERE
          isDeleted != 1
      `,
            values: [tablename_1.default.adminSetting]
        });
        return { data: rows };
    }
    async updateAdminSetting(adminSettingId, options, connection) {
        const { affectedRows } = await loaders_1.db.query({
            connection,
            sql: `UPDATE ?? SET ? WHERE ?`,
            values: [tablename_1.default.adminSetting, Object.assign({}, options), { adminSettingId }]
        });
        return affectedRows;
    }
}
exports.settingModel = new SettingModel();
