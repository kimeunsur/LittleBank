"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatModel = void 0;
const loaders_1 = require("../loaders");
const tablename_1 = __importDefault(require("./tablename"));
class ChatModel {
    async createChatRoom(options, connection) {
        const { insertId } = await loaders_1.db.query({
            connection,
            sql: `
        insert into ?? set ?
      `,
            values: [tablename_1.default.chatRoom, Object.assign({}, options)]
        });
        return insertId;
    }
    async createChatUser(options, connection) {
        await loaders_1.db.query({
            connection,
            sql: `
        insert into ?? set ?
      `,
            values: [tablename_1.default.chatUser, Object.assign({}, options)]
        });
    }
    async createChatMessage(options, connection) {
        const { insertId } = await loaders_1.db.query({
            connection,
            sql: `
        insert into ?? set ?
      `,
            values: [tablename_1.default.chatMessage, Object.assign({}, options)]
        });
        return insertId;
    }
    async findChatRoomsByProfileId(profileId, connection) {
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        select
          cr.*
        from ?? cr
        inner join ?? cu on cu.chatRoomId = cr.chatRoomId
        where cu.profileId = ?
          and cu.isDeleted = 0
      `,
            values: [tablename_1.default.chatRoom, tablename_1.default.chatUser, profileId]
        });
        return rows;
    }
    async findChatRoomById(chatRoomId, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `
      select
        *
      from ??
      where ?
      `,
            values: [tablename_1.default.chatRoom, { chatRoomId }]
        });
        return row;
    }
    async findDirectChatRoomByProfileIds(profileId, targetProfileId, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `
        SELECT 
          cr.*
        from ?? cr
        inner join ?? cu1 on cu1.chatRoomId = cr.chatRoomId
        inner join ?? cu2 on cu2.chatRoomId = cr.chatRoomId
        where cu1.profileId = ?
          and cu2.profileId = ?
          and cr.chatRoomType = 'direct'
        ;
      `,
            values: [tablename_1.default.chatRoom, tablename_1.default.chatUser, tablename_1.default.chatUser,
                profileId, targetProfileId]
        });
        return row;
    }
    async findFamilyChatRoomByUserId(userId, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `
        select
          *
        from ??
        where ?
          and chatRoomType = 'group'
      `,
            values: [tablename_1.default.chatRoom, { userId }]
        });
        return row;
    }
    async findChatUser(chatRoomId, profileId, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `
        select
          *
        from ??
        where chatRoomId = ?
          and profileId = ?
      `,
            values: [tablename_1.default.chatUser, chatRoomId, profileId]
        });
        return row;
    }
    async findProfilesInChatRoom(chatRoomId, connection) {
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        select
          p.profileId,
          p.fcmToken 
        from ?? cu
        inner join ?? p on p.profileId = cu.profileId 
          and p.isDeleted = 0
        where chatRoomId = ?
          and cu.isDeleted = 0
      `,
            values: [tablename_1.default.chatUser, tablename_1.default.profile, chatRoomId]
        });
        return rows;
    }
    async findRecentChatMessagesByChatRoomIdOrderByAscForFamily(chatRoomId, profileId, options, connection) {
        const { page, perPage } = options;
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
        -- message, photo
          cm.chatMessageId,
          cm.profileId,
          p.profileImage,
          cm.chatType,
          cm.chatContent,
          cm.createdAt,
          p.name,
        -- album
          aa.allowanceAlbumId ,
          aa.albumChat ,
          aa.albumAmount ,
          aa.albumStatus ,
          GROUP_CONCAT(ai.albumImage) AS albumImages,
        -- task
          ac.allowanceChatId ,
          ac.allowanceChat ,
          ac.allowanceAmount ,
          ac.allowanceChatStatus,
          ac.allowanceChatImage ,
          ac.allowanceContent ,
          am.allowanceMissionId,
        -- mission
          am.missionChat,
          am.missionAmount,
          am.missionStartDate,
          am.missionStatus,
          am.missionEndDate,
          am.missionParentComment,
          am.missionParentImage,
          am.missionChildComment,
          am.missionChildImage,
          am.childProfileId,
          p2.name as childProfileName
        FROM
            ?? cm
        INNER JOIN
            ?? p ON cm.profileId = p.profileId
        LEFT JOIN
            ?? aa ON cm.chatMessageId = aa.chatMessageId 
            AND aa.isDeleted != 1
        LEFT JOIN
            ?? ai ON aa.allowanceAlbumId = ai.allowanceAlbumId 
            and ai.isDeleted != 1
        LEFT JOIN
          ?? ac on ac.chatMessageId = cm.chatMessageId 
          AND ac.isDeleted != 1
        LEFT JOIN 
          ?? am on am.chatMessageId = cm.chatMessageId 
          and am.isDeleted != 1
        left JOIN 
        	?? p2 on p2.profileId = am.childProfileId 
        left join
          ?? b on b.blockProfileId = cm.profileId 
          and b.profileId = ? 
          and b.isDeleted != 1  
        inner join
          ?? cu on cu.chatRoomId = cm.chatRoomId 
          and cu.isDeleted != 1 
          and cu.profileId = ?
        WHERE
            cm.chatRoomId = ?
            AND cm.isDeleted != 1
            AND b.blockProfileId is null
            and cm.createdAt > cu.createdAt
        GROUP BY
            cm.chatMessageId
        ORDER BY
            cm.createdAt DESC
        LIMIT
          ${perPage * page - perPage}, ${perPage}
        ;
      `,
            values: [tablename_1.default.chatMessage, tablename_1.default.profile, tablename_1.default.allowanceAlbum,
                tablename_1.default.allowanceAlbumImage, tablename_1.default.allowanceChat, tablename_1.default.allowanceMission,
                tablename_1.default.profile, tablename_1.default.block, profileId,
                tablename_1.default.chatUser, profileId,
                chatRoomId
            ]
        });
        return rows;
    }
    async findRecentChatMessagesByChatRoomIdOrderByAscForGeneral(chatRoomId, options, connection) {
        const { page, perPage, followerId } = options;
        const rows = await loaders_1.db.query({
            connection,
            sql: `
        SELECT
        -- message, photo
          cm.chatMessageId,
          cm.profileId,
          p.profileImage,
          cm.chatType,
          cm.chatContent,
          cm.createdAt,
          IFNULL(b.buddyName, p.name) as name,
        -- album
          aa.allowanceAlbumId ,
          aa.albumChat ,
          aa.albumAmount ,
          aa.albumStatus ,
          GROUP_CONCAT(ai.albumImage) AS albumImages,
        -- task
          ac.allowanceChatId ,
          ac.allowanceChat ,
          ac.allowanceAmount ,
          ac.allowanceChatStatus,
          ac.allowanceChatImage ,
          ac.allowanceContent ,
          am.allowanceMissionId,
        -- mission
          am.missionChat,
          am.missionAmount,
          am.missionStartDate,
          am.missionStatus,
          am.missionEndDate,
          am.missionParentComment,
          am.missionParentImage,
          am.missionChildComment,
          am.missionChildImage,
          am.childProfileId,
          p2.name as childProfileName
        FROM
            ?? cm
        LEFT JOIN
            ?? b on b.followingId = cm.profileId and b.followerId = ?
        INNER JOIN
            ?? p ON cm.profileId = p.profileId
        LEFT JOIN
            ?? aa ON cm.chatMessageId = aa.chatMessageId 
            AND aa.isDeleted != 1
        LEFT JOIN
            ?? ai ON aa.allowanceAlbumId = ai.allowanceAlbumId 
            and ai.isDeleted != 1
        LEFT JOIN
          ?? ac on ac.chatMessageId = cm.chatMessageId 
          AND ac.isDeleted != 1
        LEFT JOIN 
          ?? am on am.chatMessageId = cm.chatMessageId 
          and am.isDeleted != 1
        left JOIN 
        	?? p2 on p2.profileId = am.childProfileId 
        left join
        	?? b2 on b2.blockProfileId = cm.profileId 
          and b2.isDeleted != 1
        inner join
          ?? cu on cu.chatRoomId = cm.chatRoomId 
          and cu.profileId = ?
          and cu.isDeleted != 1 
        WHERE
            cm.chatRoomId = ?
            AND cm.isDeleted != 1
            and b2.blockProfileId is null
            and cm.createdAt > cu.createdAt
        GROUP BY
            cm.chatMessageId
        ORDER BY
            cm.createdAt DESC
        LIMIT
          ${perPage * page - perPage}, ${perPage}
        ;
      `,
            values: [tablename_1.default.chatMessage, tablename_1.default.buddy, followerId,
                tablename_1.default.profile, tablename_1.default.allowanceAlbum, tablename_1.default.allowanceAlbumImage,
                tablename_1.default.allowanceChat, tablename_1.default.allowanceMission, tablename_1.default.profile,
                tablename_1.default.block, tablename_1.default.chatUser, followerId,
                chatRoomId]
        });
        return rows;
    }
    async findOneChatMessage(chatMessageId, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `
      select
        *
      from ??
      where ?
      `,
            values: [tablename_1.default.chatMessage, { chatMessageId }]
        });
        return row;
    }
    async findUnreadUserCounts(chatRoomId, connection) {
        return await loaders_1.db.query({
            connection,
            sql: `
        with unread_user_count as (
          SELECT 
            cm.chatMessageId ,
            count(1) as unreadUserCount
          from ?? cm 
          inner join ?? cu on cu.chatRoomId = cm.chatRoomId 
          where cm.chatRoomId = ?
            and (cu.enterAt is null or cu.enterAt <= cu.leaveAt)
            and (cu.leaveAt is null or cu.leaveAt <= cm.createdAt)
          group by cm.chatMessageId 
        )
        SELECT
            MIN(chatMessageId) AS rangeStart,
            MAX(chatMessageId) AS rangeEnd,
            unreadUserCount
        FROM unread_user_count
        GROUP BY unreadUserCount
        ORDER BY rangeStart
        ;
      `,
            values: [tablename_1.default.chatMessage, tablename_1.default.chatUser, chatRoomId]
        });
    }
    async findFamilyUnreadMessageCounts(profileId, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `
        select
          count(1) as family
        from ?? cm
        inner join ?? cu on cu.chatRoomId = cm.chatRoomId
          and cu.isDeleted = 0
        inner join ?? cr on cr.chatRoomId = cm.chatRoomId 
        left join ?? b on b.profileId = cu.profileId 
          and b.blockProfileId  = cm.profileId 
          and b.isDeleted = 0
        where cu.profileId = ?
          and cm.isDeleted = 0
          and cu.enterAt < cu.leaveAt
          and cu.leaveAt < cm.createdAt
          and cr.userId is not null
          and b.blockId is null
        ;
      `,
            values: [tablename_1.default.chatMessage, tablename_1.default.chatUser, tablename_1.default.chatRoom,
                tablename_1.default.block, profileId]
        });
        return row;
    }
    async findBuddyUnreadMessageCounts(profileId, connection) {
        const [row] = await loaders_1.db.query({
            connection,
            sql: `
        select
          count(1) as buddy
        from ?? cm
        inner join ?? cu on cu.chatRoomId = cm.chatRoomId
          and cu.isDeleted = 0
        inner join ?? cr on cr.chatRoomId = cm.chatRoomId 
        left join ?? b on b.profileId = cu.profileId 
          and b.blockProfileId  = cm.profileId 
          and b.isDeleted = 0
        where cu.profileId = ?
          and cm.isDeleted = 0
          and cu.enterAt < cu.leaveAt
          and cu.leaveAt < cm.createdAt
          and cr.userId is null
          and b.blockId is null
        ;
      `,
            values: [tablename_1.default.chatMessage, tablename_1.default.chatUser, tablename_1.default.chatRoom,
                tablename_1.default.block, profileId]
        });
        return row;
    }
    async increaseChatUserCountChatRoom(chatRoomId, connection) {
        await loaders_1.db.query({
            connection,
            sql: `
        update ?? set chatUserCount = chatUserCount + 1 where ?
      `,
            values: [tablename_1.default.chatRoom, { chatRoomId }]
        });
    }
    async updateChatUserEnterAt(chatRoomId, profileId, connection) {
        await loaders_1.db.query({
            connection,
            sql: `
        update ?? 
        set enterAt = now() 
        where chatRoomId = ? 
          and profileId = ?
          and isDeleted != 1
      `,
            values: [tablename_1.default.chatUser, chatRoomId, profileId]
        });
    }
    async updateChatUserLeaveAt(chatRoomId, profileId, connection) {
        await loaders_1.db.query({
            connection,
            sql: `
        update ?? 
        set leaveAt = now() 
        where chatRoomId = ? 
          and profileId = ?
          and isDeleted != 1
      `,
            values: [tablename_1.default.chatUser, chatRoomId, profileId]
        });
    }
    async decreaseChatUserCountChatRoom(chatRoomId, connection) {
        await loaders_1.db.query({
            connection,
            sql: `
        update ?? set chatUserCount = chatUserCount - 1 where ?
      `,
            values: [tablename_1.default.chatRoom, { chatRoomId }]
        });
    }
    async deleteChatUserByProfileId(profileId, connection) {
        await loaders_1.db.query({
            connection,
            sql: `
        update ?? set isDeleted = 1 where ?
      `,
            values: [tablename_1.default.chatUser, { profileId }]
        });
    }
}
exports.chatModel = new ChatModel();
