"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appVersionModel = void 0;
const loaders_1 = require("../loaders");
const tablename_1 = __importDefault(require("./tablename"));
class AppVersionModel {
    async getVersions(connection) {
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          deviceType,
          compulVersion,
          optVersion
        FROM ??
      `,
            values: [tablename_1.default.appVersion]
        });
        return rows;
    }
}
exports.appVersionModel = new AppVersionModel();
