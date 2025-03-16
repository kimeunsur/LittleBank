"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyModel = void 0;
const loaders_1 = require("../loaders");
const tablename_1 = __importDefault(require("./tablename"));
class HistoryModel {
    async createHistory(options, connection) {
        const { insertId } = await loaders_1.db.query({
            connection,
            sql: `INSERT INTO ?? SET ?`,
            values: [tablename_1.default.allowanceHistory, Object.assign({}, options)]
        });
        return insertId;
    }
    async findAllAllowanceHistories(profileId, options, connection) {
        const { date, page, perPage } = options;
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          ah.allowanceHistoryId,
          DATE_FORMAT(ah.createdAt, '%Y-%m-%d') AS date,
          CASE
            WHEN ah.allowanceType = 'task' THEN '용돈요청'
            WHEN ah.allowanceType = 'mission' THEN '미션'
            WHEN ah.allowanceType = 'album' THEN '앨범'
            WHEN ah.allowanceType = 'settlement' THEN '용돈입금'
          END AS allowanceType,
          CASE
            WHEN ah.allowanceType = 'task' THEN ac.allowanceContent
            WHEN ah.allowanceType = 'mission' THEN am.missionChat
            WHEN ah.allowanceType = 'album' THEN al.albumBuyerName
            WHEN ah.allowanceType = 'settlement' THEN ast.settlementType
          END AS content,
          CASE
            WHEN ah.allowanceType = 'task' THEN ac.allowanceAmount
            WHEN ah.allowanceType = 'mission' THEN am.missionAmount
            WHEN ah.allowanceType = 'album' THEN (al.albumAmount-al.albumFee)
            WHEN ah.allowanceType = 'settlement' THEN -ast.settlementAmount
          END AS amount
        FROM
          ?? ah
        LEFT JOIN
          ?? ac ON ah.allowanceType = 'task' AND ac.allowanceChatId = ah.targetId
        LEFT JOIN
          ?? am ON ah.allowanceType = 'mission' AND am.allowanceMissionId = ah.targetId
        LEFT JOIN
          ?? al ON ah.allowanceType = 'album' AND al.allowanceAlbumId = ah.targetId
        LEFT JOIN
          ?? ast ON ah.allowanceType = 'settlement' AND ast.allowanceSettlementId = ah.targetId
        WHERE
          ah.? AND ah.isDeleted != 1
          AND DATE_FORMAT(ah.createdAt, '%Y-%m') = DATE_FORMAT(STR_TO_DATE('${date}', '%Y-%m-%d'), '%Y-%m')
        ORDER BY
          ah.createdAt ASC
        LIMIT
          ${perPage * page - perPage}, ${perPage}
      `,
            values: [tablename_1.default.allowanceHistory, tablename_1.default.allowanceChat, tablename_1.default.allowanceMission, tablename_1.default.allowanceAlbum, tablename_1.default.allowanceSettlement, { profileId }]
        });
        const [total] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          COUNT(*) AS cnt
        FROM
          ??      
        WHERE
          ? AND isDeleted != 1
          AND DATE_FORMAT(createdAt, '%Y-%m') = DATE_FORMAT(STR_TO_DATE('${date}', '%Y-%m-%d'), '%Y-%m')
      `,
            values: [tablename_1.default.allowanceHistory, { profileId }]
        });
        return { data: rows, total: (total === null || total === void 0 ? void 0 : total.cnt) || 0 };
    }
    async findAllAllowanceHistoriesAdmin(options, connection) {
        const { startTime, endTime, order, page, perPage } = options;
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          ah.allowanceHistoryId,
          ah.createdAt,
          p.name,
          p.profileId,
          u.email,
          CASE
            WHEN ah.allowanceType = 'task' THEN '용돈요청'
            WHEN ah.allowanceType = 'mission' THEN '미션'          
          END AS allowanceType,
          CASE
            WHEN ah.allowanceType = 'task' THEN ac.allowanceAmount
            WHEN ah.allowanceType = 'mission' THEN am.missionAmount      
          END AS amount
        FROM
          ?? ah
        JOIN
          ?? p ON p.profileId = ah.profileId
        JOIN
          ?? u ON u.userId = p.userId
        LEFT JOIN
          ?? ac ON ah.allowanceType = 'task' AND ac.allowanceChatId = ah.targetId
        LEFT JOIN
          ?? am ON ah.allowanceType = 'mission' AND am.allowanceMissionId = ah.targetId
        WHERE
          ah.isDeleted != 1 and ah.allowanceType IN ('task', 'mission')
          ${startTime && endTime ? `AND (ah.createdAt BETWEEN '${startTime}' AND '${endTime}')` : ''}
        ORDER BY
          ah.createdAt ${order}          
        LIMIT
          ${perPage * page - perPage}, ${perPage}
      `,
            values: [tablename_1.default.allowanceHistory, tablename_1.default.profile, tablename_1.default.user, tablename_1.default.allowanceChat, tablename_1.default.allowanceMission]
        });
        const [total] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          COUNT(ah.allowanceHistoryId) AS cnt
        FROM
          ?? ah
        JOIN
          ?? p ON p.profileId = ah.profileId
        JOIN
          ?? u ON u.userId = p.userId
        LEFT JOIN
          ?? ac ON ah.allowanceType = 'task' AND ac.allowanceChatId = ah.targetId AND ac.allowanceChatStatus = 'complete'
        LEFT JOIN
          ?? am ON ah.allowanceType = 'mission' AND am.allowanceMissionId = ah.targetId AND am.missionStatus = 'complete'
        WHERE
          ah.isDeleted != 1 and ah.allowanceType IN ('task', 'mission')
          ${startTime && endTime ? `AND (ah.createdAt BETWEEN '${startTime}' AND '${endTime}')` : ''} 
      `,
            values: [tablename_1.default.allowanceHistory, tablename_1.default.profile, tablename_1.default.user, tablename_1.default.allowanceChat, tablename_1.default.allowanceMission]
        });
        return { data: rows, total: (total === null || total === void 0 ? void 0 : total.cnt) || 0 };
    }
    async findAllAllowanceAlbumHistoriesAdmin(options, connection) {
        const { startTime, endTime, order, page, perPage } = options;
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          ah.allowanceHistoryId,
          ah.createdAt,
          p.name,
          p.profileId,
          u.email,
          CASE           
            WHEN ah.allowanceType = 'album' THEN '앨범'       
          END AS allowanceType,
          al.albumAmount AS amount,
          al.albumFee,
          (al.albumAmount - al.albumFee) AS realAmount
        FROM
          ?? ah
        JOIN
          ?? p ON p.profileId = ah.profileId
        JOIN
          ?? u ON u.userId = p.userId
        LEFT JOIN
          ?? al ON ah.allowanceType = 'album' AND al.allowanceAlbumId = ah.targetId        
        WHERE
          ah.isDeleted != 1 and ah.allowanceType IN ('album')
          ${startTime && endTime ? `AND (ah.createdAt BETWEEN '${startTime}' AND '${endTime}')` : ''}
        ORDER BY
          ah.createdAt ${order}          
        LIMIT
          ${perPage * page - perPage}, ${perPage}
      `,
            values: [tablename_1.default.allowanceHistory, tablename_1.default.profile, tablename_1.default.user, tablename_1.default.allowanceAlbum]
        });
        const [total] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          COUNT(ah.allowanceHistoryId) AS cnt
        FROM
          ?? ah
        JOIN
          ?? p ON p.profileId = ah.profileId
        JOIN
          ?? u ON u.userId = p.userId
        LEFT JOIN
          ?? al ON ah.allowanceType = 'album' AND al.allowanceAlbumId = ah.targetId  
        WHERE
          ah.isDeleted != 1 and ah.allowanceType IN ('album')
          ${startTime && endTime ? `AND (ah.createdAt BETWEEN '${startTime}' AND '${endTime}')` : ''} 
      `,
            values: [tablename_1.default.allowanceHistory, tablename_1.default.profile, tablename_1.default.user, tablename_1.default.allowanceAlbum]
        });
        return { data: rows, total: (total === null || total === void 0 ? void 0 : total.cnt) || 0 };
    }
    async sumAllAllowanceHistories(profileId, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          COALESCE(SUM(ac.allowanceAmount), 0) AS allowanceAmount,
          COALESCE(SUM(am.missionAmount), 0) AS missionAmount,
          COALESCE(SUM(aa.albumAmount), 0) AS albumAmount,          
          (
          COALESCE(SUM(ac.allowanceAmount), 0) +
          COALESCE(SUM(am.missionAmount), 0) +
          COALESCE(SUM(aa.albumAmount-aa.albumFee), 0)
          ) - COALESCE(SUM(ast.settlementAmount), 0) AS balance         
        FROM
          ?? ah
        LEFT JOIN
          ?? ac ON ah.allowanceType = 'task' AND ac.allowanceChatId = ah.targetId
        LEFT JOIN
          ?? am ON ah.allowanceType = 'mission' AND am.allowanceMissionId = ah.targetId
        LEFT JOIN
          ?? aa ON ah.allowanceType = 'album' AND aa.allowanceAlbumId = ah.targetId
        LEFT JOIN
          ?? ast ON ah.allowanceType = 'settlement' AND ast.allowanceSettlementId = ah.targetId
        WHERE
          ah.? AND ah.isDeleted != 1          
      `,
            values: [tablename_1.default.allowanceHistory, tablename_1.default.allowanceChat, tablename_1.default.allowanceMission, tablename_1.default.allowanceAlbum, tablename_1.default.allowanceSettlement, { profileId }]
        });
        return row;
    }
    async findFamilyProfileWithAmount(userId, profileId, date, connection) {
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          p.profileId,
          p.profileImage,
          p.name,
          COALESCE(SUM(ac.allowanceAmount), 0) AS allowanceAmount,
          COALESCE(SUM(am.missionAmount), 0) AS missionAmount,
          COALESCE(SUM(aa.albumAmount-aa.albumFee), 0) AS albumAmount
        FROM
          ?? p
        LEFT JOIN
          ?? ah ON ah.profileId = p.profileId
        LEFT JOIN
          ?? ac ON ah.allowanceType = 'task' AND ac.allowanceChatId = ah.targetId
        LEFT JOIN
          ?? am ON ah.allowanceType = 'mission' AND am.allowanceMissionId = ah.targetId
        LEFT JOIN
           ?? aa ON ah.allowanceType = 'album' AND aa.allowanceAlbumId = ah.targetId
        WHERE
          p.? AND p.isDeleted != 1 AND p.isParent = 0
          AND DATE_FORMAT(ah.createdAt, '%Y-%m') = DATE_FORMAT(STR_TO_DATE('${date}', '%Y-%m-%d'), '%Y-%m')
        GROUP BY
          p.profileId
        ORDER BY
          p.profileId ASC
      `,
            values: [tablename_1.default.profile, tablename_1.default.allowanceHistory, tablename_1.default.allowanceChat, tablename_1.default.allowanceMission, tablename_1.default.allowanceAlbum, { userId }]
        });
        return rows;
    }
    async findBuddyProfileWithAmount(profileId, date, connection) {
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          p.profileId,
          p.profileImage,
          p.name,
          COALESCE(SUM(ac.allowanceAmount), 0) AS allowanceAmount,
          COALESCE(SUM(am.missionAmount), 0) AS missionAmount,
          COALESCE(SUM(aa.albumAmount-aa.albumFee), 0) AS albumAmount
        FROM
          ?? b        
        JOIN
          ?? p ON b.followingId = p.profileId AND b.buddyStatus = 'buddy'
        LEFT JOIN
          ?? ah ON ah.profileId = p.profileId
         LEFT JOIN
          ?? ac ON ah.allowanceType = 'task' AND ac.allowanceChatId = ah.targetId
        LEFT JOIN
          ?? am ON ah.allowanceType = 'mission' AND am.allowanceMissionId = ah.targetId
        LEFT JOIN
          ?? aa ON ah.allowanceType = 'album' AND aa.allowanceAlbumId = ah.targetId
        WHERE
          b.followerId = ? AND b.isDeleted != 1
          AND DATE_FORMAT(ah.createdAt, '%Y-%m') = DATE_FORMAT(STR_TO_DATE('${date}', '%Y-%m-%d'), '%Y-%m')
          AND p.isParent = 0
        GROUP BY
          p.profileId
        ORDER BY
          b.createdAt DESC
      `,
            values: [tablename_1.default.buddy, tablename_1.default.profile, tablename_1.default.allowanceHistory, tablename_1.default.allowanceChat, tablename_1.default.allowanceMission, tablename_1.default.allowanceAlbum, profileId]
        });
        return rows;
    }
}
exports.historyModel = new HistoryModel();
