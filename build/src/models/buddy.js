"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buddyModel = void 0;
const loaders_1 = require("../loaders");
const tablename_1 = __importDefault(require("./tablename"));
class BuddyModel {
    async createBuddy(options, connection) {
        const { insertId } = await loaders_1.db.query({
            connection,
            sql: `INSERT INTO ?? SET ?`,
            values: [tablename_1.default.buddy, Object.assign({}, options)]
        });
        return insertId;
    }
    async findBuddyName(options, connection) {
        const { followerId, followingId } = options;
        const [row] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          buddyName
        FROM
          ?? 
        WHERE
          followerId = ? AND followingId = ?
          and isDeleted != 1
      `,
            values: [tablename_1.default.buddy, followerId, followingId]
        });
        return row;
    }
    async isFriedship(followerId, followingId, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          buddyId
        FROM
          ?? 
        WHERE
          followerId = ? AND followingId = ?
          and isDeleted != 1
      `,
            values: [tablename_1.default.buddy, followerId, followingId]
        });
        return row;
    }
    async findBuddiesInChatRoom(chatRoomId, profileId, connection) {
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          b.buddyId,
          b.followerId,
          b.followingId,
          b.buddyName
        FROM
          ?? b
        inner join 
          ?? cu on cu.profileId = b.followerId
          and cu.chatRoomId = ?
        WHERE
          b.followingId = ? 
          AND b.isDeleted != 1
      `,
            values: [tablename_1.default.buddy, tablename_1.default.chatUser, chatRoomId, profileId]
        });
        return rows;
    }
    async findAllBuddies(profileId, options, connection) {
        const { page, perPage } = options;
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT      
          p.profileImage,
          p.name,
          b.followingId AS profileId,
          b.buddyName,
          p.relation,
          u.email
        FROM
          ?? b
        JOIN
          ?? p ON p.profileId = b.followingId
        JOIN 
          ?? u ON u.userId = p.userId    
        WHERE
          b.followerId = ? AND b.isDeleted != 1          
        ORDER BY
          b.createdAt DESC
        LIMIT
          ${perPage * page - perPage}, ${perPage}       
      `,
            values: [tablename_1.default.buddy, tablename_1.default.profile, tablename_1.default.user, profileId]
        });
        const [total] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          COUNT(*) AS cnt
        FROM
          ??      
        WHERE
          followerId = ? AND isDeleted != 1
      `,
            values: [tablename_1.default.buddy, profileId]
        });
        return { data: rows, total: (total === null || total === void 0 ? void 0 : total.cnt) || 0 };
    }
    async findAllBuddiesSearch(userId, profileId, options, connection) {
        const { email, page, perPage } = options;
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT      
          p.profileId,
          p.profileImage,
          p.name,        
          p.relation,
          u.email       
        FROM
          ?? p
        JOIN 
          ?? u ON u.userId = p.userId    
        LEFT JOIN
          ?? b on b.profileId = p.profileId 
          AND b.isDeleted = 0
          AND b.blockProfileId = ?
        LEFT JOIN
          ?? b2 on b2.blockProfileId = p.profileId 
          AND b2.isDeleted = 0
          AND b2.profileId = ?
        LEFT JOIN
          ?? b3 on b3.followingId = p.profileId 
          and b3.isDeleted = 0
          and b3.followerId = ?
        WHERE
          p.isDeleted != 1 
          AND p.userId != ?
          ${email ? `AND (u.email LIKE '%${email}%')` : ''}
          AND b.blockProfileId is null
          AND b2.blockProfileId is null
          and b3.followerId is null
        ORDER BY
          p.createdAt DESC
        LIMIT
          ${perPage * page - perPage}, ${perPage}       
      `,
            values: [
                tablename_1.default.profile,
                tablename_1.default.user,
                tablename_1.default.block,
                profileId,
                tablename_1.default.block,
                profileId,
                tablename_1.default.buddy,
                profileId,
                userId
            ]
        });
        const [total] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          COUNT(p.profileId) AS cnt
        FROM
          ?? p
        JOIN 
          ?? u ON u.userId = p.userId    
        LEFT JOIN
          ?? b on b.profileId = p.profileId 
          AND b.isDeleted = 0
          AND b.blockProfileId = ?
        LEFT JOIN
          ?? b2 on b2.blockProfileId = p.profileId 
          AND b2.isDeleted = 0
          AND b2.profileId = ?
        LEFT JOIN
          ?? b3 on b3.followingId = p.profileId 
          and b3.isDeleted = 0
          and b3.followerId = ?
        WHERE
          p.isDeleted != 1
          AND p.userId != ?
          ${email ? `AND (u.email LIKE '%${email}%')` : ''}
          AND b.blockProfileId is null
          AND b2.blockProfileId is null
          and b3.followerId is null
      `,
            values: [
                tablename_1.default.profile,
                tablename_1.default.user,
                tablename_1.default.block,
                profileId,
                tablename_1.default.block,
                profileId,
                tablename_1.default.buddy,
                profileId,
                userId
            ]
        });
        return { data: rows, total: (total === null || total === void 0 ? void 0 : total.cnt) || 0 };
    }
    /**
     * 나를 팔로우하는 친구 목록을 가져옵니다.
     * @param profileId
     * @param connection
     * @returns
     */
    async findBuddyProfiles(profileId, connection) {
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
          p.profileId,
          p.fcmToken,
          b.buddyId,
          b.followerId,
          b.followingId,
          b.buddyName
        FROM
          ?? b
        INNER JOIN
          ?? p ON p.profileId = b.followerId
        WHERE
          b.followingId = ? 
          AND b.isDeleted != 1          
        ORDER BY
          b.createdAt DESC
      `,
            values: [tablename_1.default.buddy, tablename_1.default.profile, profileId]
        });
        return rows;
    }
    async findBuddiesNews(profileId, options, connection) {
        const { page, perPage } = options;
        const data = await loaders_1.db.query({
            connection,
            sql: `
        SELECT 
          cm.chatMessageId,
          IFNULL(ac.profileId, am.childProfileId) as profileId, 
          cm.chatType,
          cm.createdAt,
          b.buddyName as name,
          p.profileImage ,
        -- task
          ac.allowanceChatId ,
          ac.allowanceAmount ,
          ac.allowanceChatStatus,
          ac.allowanceChatImage ,
          ac.allowanceContent , -- 용돈 항목
        -- mission
          am.allowanceMissionId,
          am.missionChat, -- 미션 항목
          am.missionAmount,
          am.missionStartDate,
          am.missionStatus,
          am.missionEndDate,
          am.missionParentImage,
          am.missionChildImage,
          am.childProfileId
        from ?? cm 
        left join ?? am on am.chatMessageId = cm.chatMessageId 
          and am.missionStatus = 'complete'
          and am.isDeleted != 1 
        left join ?? ac on ac.chatMessageId = cm.chatMessageId 
          and ac.allowanceChatStatus = 'complete'
          and ac.isDeleted != 1 
        inner join ?? b on (b.followingId = am.childProfileId or b.followingId = ac.profileId)
          and b.followerId = ?
          and b.isDeleted != 1 
        left join ?? bl on bl.blockProfileId = IFNULL(ac.profileId, am.childProfileId)
          and bl.profileId = ?
          and bl.isDeleted != 1 
        inner join ?? p on p.profileId = IFNULL(ac.profileId, am.childProfileId) 
          and p.isDeleted != 1
        where (am.allowanceMissionId is not null
          or ac.allowanceChatId is not null)
          and bl.blockProfileId is null
          and cm.isDeleted != 1
        order by cm.createdAt desc
        limit 
          ${perPage * page - perPage}, ${perPage}       
      `,
            values: [
                tablename_1.default.chatMessage,
                tablename_1.default.allowanceMission,
                tablename_1.default.allowanceChat,
                tablename_1.default.buddy,
                profileId,
                tablename_1.default.block,
                profileId,
                tablename_1.default.profile
            ]
        });
        const [total] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT 
          COUNT(1) as total
        from ?? cm 
        left join ?? am on am.chatMessageId = cm.chatMessageId 
          and am.missionStatus = 'complete'
          and am.isDeleted != 1 
        left join ?? ac on ac.chatMessageId = cm.chatMessageId 
          and ac.allowanceChatStatus = 'complete'
          and ac.isDeleted != 1 
        inner join ?? b on (b.followingId = am.childProfileId or b.followingId = ac.profileId)
          and b.followerId = ?
          and b.isDeleted != 1 
        left join ?? bl on bl.blockProfileId = IFNULL(ac.profileId, am.childProfileId)
          and bl.profileId = ?
          and bl.isDeleted != 1 
        inner join ?? p on p.profileId = IFNULL(ac.profileId, am.childProfileId) 
          and p.isDeleted != 1
        where (am.allowanceMissionId is not null
          or ac.allowanceChatId is not null)
          and bl.blockProfileId is null
          and cm.isDeleted != 1
      `,
            values: [
                tablename_1.default.chatMessage,
                tablename_1.default.allowanceMission,
                tablename_1.default.allowanceChat,
                tablename_1.default.buddy,
                profileId,
                tablename_1.default.block,
                profileId,
                tablename_1.default.profile
            ]
        });
        return { data, total: total.total || 0 };
    }
    async updateBuddy(options, buddyName, connection) {
        const { followerId, followingId } = options;
        const { affectedRows } = await loaders_1.db.query({
            connection,
            sql: `UPDATE ?? SET ? WHERE ? AND ?`,
            values: [tablename_1.default.buddy, { buddyName }, { followerId }, { followingId }]
        });
        return affectedRows;
    }
    async deleteBuddy(options, connection) {
        const { followerId, followingId } = options;
        const { affectedRows } = await loaders_1.db.query({
            connection,
            sql: `UPDATE ?? SET isDeleted = true, deletedAt = now() WHERE ? AND ?`,
            values: [tablename_1.default.buddy, { followerId }, { followingId }]
        });
        return affectedRows;
    }
}
exports.buddyModel = new BuddyModel();
