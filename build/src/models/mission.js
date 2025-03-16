"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.missionModel = void 0;
const loaders_1 = require("../loaders");
const tablename_1 = __importDefault(require("./tablename"));
class MissionModel {
    async createMissionChat(options, connection) {
        const { insertId } = await loaders_1.db.query({
            connection,
            sql: `INSERT INTO ?? SET ?`,
            values: [tablename_1.default.allowanceMission, Object.assign({}, options)]
        });
        return insertId;
    }
    async findOneMission(allowanceMissionId, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `SELECT * FROM ?? WHERE ? AND isDeleted != 1`,
            values: [tablename_1.default.allowanceMission, { allowanceMissionId }]
        });
        return row;
    }
    async updateMissionChat(allowanceMissionId, options, connection) {
        const { affectedRows } = await loaders_1.db.query({
            connection,
            sql: `UPDATE ?? SET ? WHERE ? `,
            values: [tablename_1.default.allowanceMission, Object.assign({}, options), { allowanceMissionId }]
        });
        return affectedRows;
    }
    async deleteMissionChat(allowanceMissionId, connection) {
        const { affectedRows } = await loaders_1.db.query({
            connection,
            sql: `UPDATE ?? SET isDeleted = true, deletedAt = now() WHERE ? `,
            values: [tablename_1.default.allowanceMission, { allowanceMissionId }]
        });
        return affectedRows;
    }
}
exports.missionModel = new MissionModel();
