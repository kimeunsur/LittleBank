import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import TableName from './tablename'

class HistoryModel{
  async createHistory(options:{  
    profileId:number,
    allowanceType:string,
    targetId:number
  }, connection?: PoolConnection): Promise<any> {      
      const {insertId} = await db.query({
        connection,
        sql: `INSERT INTO ?? SET ?`,
        values: [TableName.allowanceHistory, {...options}]
      })
      return insertId
  }  

  async findAllAllowanceHistories(profileId:number, options: {date: string, page: number,perPage: number}, connection?: PoolConnection): Promise<any> {
    const {date, page, perPage} = options
    const rows = await db.query({
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
      values: [TableName.allowanceHistory, TableName.allowanceChat, TableName.allowanceMission, TableName.allowanceAlbum, TableName.allowanceSettlement, {profileId}]
    })
  
    const [total] = await db.query({
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
      values: [TableName.allowanceHistory, {profileId}]
    })
  
      return {data: rows, total: total?.cnt || 0}   
  }

  async findAllAllowanceHistoriesAdmin(options: {startTime?: string, endTime?: string, order: string, page: number, perPage: number}, connection?: PoolConnection): Promise<any> {
    const {startTime, endTime, order, page, perPage} = options
    const rows = await db.query({
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
      values: [TableName.allowanceHistory, TableName.profile, TableName.user, TableName.allowanceChat, TableName.allowanceMission]
    })
  
    const [total] = await db.query({
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
      values: [TableName.allowanceHistory, TableName.profile, TableName.user, TableName.allowanceChat, TableName.allowanceMission]
    })
  
      return {data: rows, total: total?.cnt || 0}   
  }

  async findAllAllowanceAlbumHistoriesAdmin(options: {startTime?: string, endTime?: string, order: string, page: number, perPage: number}, connection?: PoolConnection): Promise<any> {
    const {startTime, endTime, order, page, perPage} = options
    const rows = await db.query({
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
      values: [TableName.allowanceHistory, TableName.profile, TableName.user, TableName.allowanceAlbum]
    })
  
    const [total] = await db.query({
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
      values: [TableName.allowanceHistory, TableName.profile, TableName.user, TableName.allowanceAlbum]
    })
  
      return {data: rows, total: total?.cnt || 0}   
  }

  async sumAllAllowanceHistories(profileId:number, connection?: PoolConnection): Promise<any> {    
    const [row] = await db.query({
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
      values: [TableName.allowanceHistory, TableName.allowanceChat, TableName.allowanceMission, TableName.allowanceAlbum, TableName.allowanceSettlement, {profileId}]
    })    
  
      return row   
  }

  async findFamilyProfileWithAmount(userId:number, profileId:number, date: string, connection?: PoolConnection): Promise<any> {    
    const rows = await db.query({
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
      values: [TableName.profile, TableName.allowanceHistory, TableName.allowanceChat, TableName.allowanceMission, TableName.allowanceAlbum, {userId}]
    })
  
     return rows   
  }

  async findBuddyProfileWithAmount(profileId:number, date:string, connection?: PoolConnection): Promise<any> {    
    const rows = await db.query({
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
      values: [TableName.buddy, TableName.profile, TableName.allowanceHistory, TableName.allowanceChat, TableName.allowanceMission, TableName.allowanceAlbum, profileId]
    })
  
     return rows   
  }
  
}

export const historyModel = new HistoryModel()