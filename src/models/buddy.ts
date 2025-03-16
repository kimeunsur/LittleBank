import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import TableName from './tablename'

class BuddyModel{
  async createBuddy(options:{
    followerId:number,
    followingId:number,
    buddyName:string,
    buddyStatus:string},
    connection?: PoolConnection): Promise<any> {      
      const {insertId} = await db.query({
        connection,
        sql: `INSERT INTO ?? SET ?`,
        values: [TableName.buddy, {...options}]
      })
      return insertId
  }

  async findBuddyName(options:{followerId:number,followingId:number}, connection?: PoolConnection): Promise<any> {
    const {followerId, followingId} = options
    const [row] = await db.query({
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
      values: [TableName.buddy, followerId, followingId]
    })
    return row
  }

  async isFriedship(followerId: number, followingId: number, connection?: PoolConnection): Promise<any> {
    const [row] = await db.query({
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
      values: [TableName.buddy, followerId, followingId]
    })
    return row
  }

  async findBuddiesInChatRoom(chatRoomId: number, profileId: number, connection: PoolConnection) {
    const rows = await db.query({
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
      values: [TableName.buddy, TableName.chatUser, chatRoomId, profileId]
    })

    return rows
  }

  async findAllBuddies(profileId:number, options: {page: number,perPage: number}, connection?: PoolConnection): Promise<any> {
    const {page, perPage} = options
    const rows = await db.query({
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
      values: [TableName.buddy, TableName.profile, TableName.user, profileId]
    })
  
    const [total] = await db.query({
      connection,
      sql: `
        SELECT
          COUNT(*) AS cnt
        FROM
          ??      
        WHERE
          followerId = ? AND isDeleted != 1
      `,
      values: [TableName.buddy, profileId]
    })
  
      return {data: rows, total: total?.cnt || 0}   
  }

  async findAllBuddiesSearch(userId:number, profileId: number, options: {email:string, page: number,perPage: number}, connection?: PoolConnection): Promise<any> {
    const {email, page, perPage} = options
    const rows = await db.query({
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
        TableName.profile, 
        TableName.user, 
        TableName.block, 
        profileId, 
        TableName.block, 
        profileId, 
        TableName.buddy,
        profileId,
        userId
      ]
    })
  
    const [total] = await db.query({
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
        TableName.profile, 
        TableName.user, 
        TableName.block, 
        profileId, 
        TableName.block, 
        profileId, 
        TableName.buddy,
        profileId,
        userId
      ]
    })
  
      return {data: rows, total: total?.cnt || 0}   
  }

  /**
   * 나를 팔로우하는 친구 목록을 가져옵니다.
   * @param profileId 
   * @param connection 
   * @returns 
   */
  async findBuddyProfiles(profileId: number, connection?: PoolConnection): Promise<any> {
    const rows = await db.query({
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
      values: [TableName.buddy, TableName.profile, profileId]
    })
  
    return rows
  }


  async findBuddiesNews(profileId:number, options: {page: number,perPage: number}, connection?: PoolConnection): Promise<any> {
    const {page, perPage} = options
    const data = await db.query({
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
        TableName.chatMessage, 
        TableName.allowanceMission, 
        TableName.allowanceChat, 
        TableName.buddy, 
        profileId, 
        TableName.block, 
        profileId, 
        TableName.profile
      ]
    })

    const [total] = await db.query({
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
        TableName.chatMessage, 
        TableName.allowanceMission, 
        TableName.allowanceChat, 
        TableName.buddy, 
        profileId, 
        TableName.block, 
        profileId, 
        TableName.profile
      ]
    })
  
    return {data, total: total.total || 0}   
  }

  async updateBuddy(options:{followerId:number,followingId:number}, buddyName:string,connection?: PoolConnection    
  ): Promise<any> {
    const {followerId, followingId} = options
    const {affectedRows} = await db.query({
      connection,
      sql: `UPDATE ?? SET ? WHERE ? AND ?`,
      values: [TableName.buddy, {buddyName}, {followerId}, {followingId}]
    })

    return affectedRows  
  }

  async deleteBuddy(options:{followerId:number,followingId:number},connection?: PoolConnection    
  ): Promise<any> {      
    const {followerId, followingId} = options
      const {affectedRows} = await db.query({
        connection,
        sql: `UPDATE ?? SET isDeleted = true, deletedAt = now() WHERE ? AND ?`,
        values: [TableName.buddy, {followerId}, {followingId}]
      })

      return affectedRows  
  }
  
}

export const buddyModel = new BuddyModel()