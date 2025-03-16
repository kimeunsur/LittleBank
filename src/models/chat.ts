import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import TableName from './tablename'
import {ChatRoomType} from '../interfaces/chatRoomType'

class ChatModel {
  async createChatRoom(options: {userId: number; chatRoomType: ChatRoomType}, connection?: PoolConnection) {
    const {insertId} = await db.query({
      connection,
      sql: `
        insert into ?? set ?
      `,
      values: [TableName.chatRoom, {...options}]
    })
    return insertId
  }

  async createChatUser(
    options: {
      chatRoomId: number
      profileId: number
    },
    connection?: PoolConnection
  ) {
    await db.query({
      connection,
      sql: `
        insert into ?? set ?
      `,
      values: [TableName.chatUser, {...options}]
    })
  }

  async createChatMessage(
    options: {chatRoomId: number; profileId: number; chatType: string; chatContent: string},
    connection?: PoolConnection
  ) {
    const {insertId} = await db.query({
      connection,
      sql: `
        insert into ?? set ?
      `,
      values: [TableName.chatMessage, {...options}]
    })
    return insertId
  }

  async findChatRoomsByProfileId(profileId: number, connection?: PoolConnection) {
    const rows = await db.query({
      connection,
      sql: `
        select
          cr.*
        from ?? cr
        inner join ?? cu on cu.chatRoomId = cr.chatRoomId
        where cu.profileId = ?
          and cu.isDeleted = 0
      `,
      values: [TableName.chatRoom, TableName.chatUser, profileId]
    })
    return rows
  }

  async findChatRoomById(chatRoomId: number, connection?: PoolConnection) {
    const [row] = await db.query({
      connection,
      sql: `
      select
        *
      from ??
      where ?
      `,
      values: [TableName.chatRoom, {chatRoomId}]
    })
    return row
  }

  async findDirectChatRoomByProfileIds(profileId: number, targetProfileId: number, connection?: PoolConnection) {
    const [row] = await db.query({
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
      values: [TableName.chatRoom, TableName.chatUser, TableName.chatUser, 
        profileId, targetProfileId]
    })
    return row
  }

  async findFamilyChatRoomByUserId(userId: number, connection?: PoolConnection) {
    const [row] = await db.query({
      connection,
      sql: `
        select
          *
        from ??
        where ?
          and chatRoomType = 'group'
      `,
      values: [TableName.chatRoom, {userId}]
    })
    return row
  }

  async findChatUser(chatRoomId: number, profileId: number, connection?: PoolConnection) {
    const [row] = await db.query({
      connection,
      sql: `
        select
          *
        from ??
        where chatRoomId = ?
          and profileId = ?
      `,
      values: [TableName.chatUser, chatRoomId, profileId]
    })
    return row
  }

  async findProfilesInChatRoom(chatRoomId: number, connection?: PoolConnection) {
    const rows = await db.query({
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
      values: [TableName.chatUser, TableName.profile, chatRoomId]
    })
    return rows
  }

  async findRecentChatMessagesByChatRoomIdOrderByAscForFamily(
    chatRoomId: number,
    profileId: number,
    options: {page: number; perPage: number},
    connection?: PoolConnection
  ) {
    const {page, perPage} = options
    const rows = await db.query({
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
      values: [TableName.chatMessage, TableName.profile, TableName.allowanceAlbum, 
        TableName.allowanceAlbumImage, TableName.allowanceChat, TableName.allowanceMission,
        TableName.profile, TableName.block, profileId, 
        TableName.chatUser, profileId, 
        chatRoomId
      ]
    })
    return rows
  }

  async findRecentChatMessagesByChatRoomIdOrderByAscForGeneral(
    chatRoomId: number,
    options: {page: number; perPage: number; followerId?: number},
    connection?: PoolConnection
  ) {
    const {page, perPage, followerId} = options
    const rows = await db.query({
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
      values: [TableName.chatMessage, TableName.buddy, followerId, 
        TableName.profile, TableName.allowanceAlbum, TableName.allowanceAlbumImage,
        TableName.allowanceChat, TableName.allowanceMission, TableName.profile,
        TableName.block, TableName.chatUser, followerId, 
        chatRoomId]
    })
    return rows
  }

  async findOneChatMessage(chatMessageId: number, connection?: PoolConnection) {
    const [row] = await db.query({
      connection,
      sql: `
      select
        *
      from ??
      where ?
      `,
      values: [TableName.chatMessage, {chatMessageId}]
    })
    return row
  }

  async findUnreadUserCounts(chatRoomId: number, connection?: PoolConnection) {
    return await db.query({
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
      values: [TableName.chatMessage, TableName.chatUser, chatRoomId]
    })
  }

  async findFamilyUnreadMessageCounts(profileId: number, connection?: PoolConnection) {
    const [row] = await db.query({
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
      values: [TableName.chatMessage, TableName.chatUser, TableName.chatRoom, 
        TableName.block, profileId]
    })
    return row
  }

  async findBuddyUnreadMessageCounts(profileId: number, connection?: PoolConnection) {
    const [row] = await db.query({
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
      values: [TableName.chatMessage, TableName.chatUser, TableName.chatRoom,
        TableName.block, profileId]
    })
    return row
  }

  async increaseChatUserCountChatRoom(chatRoomId: number, connection?: PoolConnection) {
    await db.query({
      connection,
      sql: `
        update ?? set chatUserCount = chatUserCount + 1 where ?
      `,
      values: [TableName.chatRoom, {chatRoomId}]
    })
  }

  async updateChatUserEnterAt(chatRoomId: number, profileId: number, connection?: PoolConnection) {
    await db.query({
      connection,
      sql: `
        update ?? 
        set enterAt = now() 
        where chatRoomId = ? 
          and profileId = ?
          and isDeleted != 1
      `,
      values: [TableName.chatUser, chatRoomId, profileId]
    })
  }

  async updateChatUserLeaveAt(chatRoomId: number, profileId: number, connection?: PoolConnection) {
    await db.query({
      connection,
      sql: `
        update ?? 
        set leaveAt = now() 
        where chatRoomId = ? 
          and profileId = ?
          and isDeleted != 1
      `,
      values: [TableName.chatUser, chatRoomId, profileId]
    })
  }

  async decreaseChatUserCountChatRoom(chatRoomId: number, connection?: PoolConnection) {
    await db.query({
      connection,
      sql: `
        update ?? set chatUserCount = chatUserCount - 1 where ?
      `,
      values: [TableName.chatRoom, {chatRoomId}]
    })
  }

  async deleteChatUserByProfileId(profileId: number, connection?: PoolConnection) {
    await db.query({
      connection,
      sql: `
        update ?? set isDeleted = 1 where ?
      `,
      values: [TableName.chatUser, {profileId}]
    })
  }
}

export const chatModel = new ChatModel()
