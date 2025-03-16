import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import TableName from './tablename'

class ProfileModel{
  async createProfile(options:{
    userId:number, 
    profilePass:string,  
    name:string, 
    relation:string,  
    fcmToken?:string,
    profileImage?:string,
    bankCode?:string,
    bankName?:string,
    bankAccount?:string,
    isParent?:boolean,
    accountInfo?: {}, 
  }, connection?: PoolConnection): Promise<any> {      
      const {insertId} = await db.query({
        connection,
        sql: `INSERT INTO ?? SET ?`,
        values: [TableName.profile, {...options}]
      })
      return insertId
  }

  async findOneProfileById(profileId: number, connection?: PoolConnection): Promise<any> { 
    const [row] = await db.query({
      connection,
      sql: `SELECT * FROM ?? WHERE ? AND isDeleted != 1`,
      values: [TableName.profile, {profileId}]
    })

    return row 
  }

  async findOneProfileByName(userId: number, name:string, connection?: PoolConnection): Promise<any> { 
      const [row] = await db.query({
        connection,
        sql: `SELECT * FROM ?? WHERE ? AND ? AND isDeleted != 1`,
        values: [TableName.profile, {name}, {userId}]
      })

      return row 
  }

  async findOneProfileByRef(refreshToken: string, connection?: PoolConnection): Promise<any> {

    const [row] = await db.query({
      connection,
      sql: `SELECT * FROM ?? WHERE ? AND isDeleted != 1`,
      values: [TableName.profile, {refreshToken}]
    })

    return row  
  }

  async findOneFcmToken(profileId: number, connection?: PoolConnection): Promise<any> {
    const [row] = await db.query({
      connection,
      sql: `SELECT fcmToken FROM ?? WHERE ? AND isDeleted != 1`,
      values: [TableName.profile, {profileId}]
    })

    return row.fcmToken
  }

  async updateProfileById(
    profileId: number,
    options: {
      refreshToken?: string,
      fcmToken?: string,
      profilePass?:string,
      profileImage?:string,
      name?:string,
      bankCode?:string,
      bankName?:string,
      bankAccount?:string,
      customerUid?:string,
      parentAmount?:number,
      childAmount?:number
    },
    connection?: PoolConnection
  ): Promise<any> {      
      const {affectedRows} = await db.query({
        connection,
        sql: `UPDATE ?? SET ? WHERE ?`,
        values: [TableName.profile, {...options}, {profileId}]
      })

      return affectedRows  
  }  

  async findFamilyProfilesInfoExcludingUser(userId:number, profileId:number, connection?: PoolConnection): Promise<any> {  
    const rows = await db.query({
      connection,
      sql: `
        SELECT
         * 
        FROM ?? 
        WHERE ? 
          AND profileId != ? 
          AND isDeleted != 1
      `,
      values: [TableName.profile, {userId}, profileId]
    })

    return rows 
  }

  async findOneFamilyNameById(profileId: number, connection?: PoolConnection): Promise<string> {
    const [row] = await db.query({
      connection,
      sql: `
        SELECT 
          p.name
        from ?? p
        where p.profileId = ?
      `,
      values: [TableName.profile, profileId]
    })
    return row.name
  }

  async findFamilyProfiles(userId:number, options: {page: number,perPage: number}, connection?: PoolConnection): Promise<any> {
    const {page, perPage} = options
    const rows = await db.query({
      connection,
      sql: `
        SELECT    
          *
        FROM
          ??        
        WHERE
          ? AND isDeleted != 1     
        LIMIT
          ${perPage * page - perPage}, ${perPage}       
      `,
      values: [TableName.profile, {userId}]
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
      `,
      values: [TableName.profile, {userId}]
    })
  
      return {data: rows, total: total?.cnt || 0}   
  }

  async findAllProfilesForAdmin(options: {search?:string, order?:string,page: number,perPage: number}, connection?: PoolConnection): Promise<any> {
    const {search, order, page, perPage} = options
    const rows = await db.query({
      connection,
      sql: `
        SELECT
          p.profileId,
          p.userId,
          u.email,
          u.password,
          p.relation,
          p.name,
          p.profilePass,
          u.phone,
          u.createdAt as userCreatedAt,
          p.createdAt as profileCreatedAt,
          (CASE 
            WHEN isParent = 1 THEN parentAmount
            WHEN isParent = 0 THEN childAmount
          END) AS amount,
          p.bankName,
          p.bankAccount
        FROM
          ?? p
        JOIN
          ?? u ON p.userId = u.userId
        WHERE
          p.isDeleted != 1
          ${search ? `AND (u.email LIKE '%${search}%' OR u.phone LIKE '%${search}%')` : ''}
        ORDER BY
          p.createdAt ${order}
        LIMIT
          ${perPage * page - perPage}, ${perPage}       
      `,
      values: [TableName.profile, TableName.user]
    })
  
    const [total] = await db.query({
      connection,
      sql: `
        SELECT
          COUNT(p.profileId) AS cnt
        FROM
          ?? p
        JOIN
          ?? u ON p.userId = u.userId
        WHERE
          p.isDeleted != 1
          ${search ? `AND (u.email LIKE '%${search}%' OR u.phone LIKE '%${search}%')` : ''}
      `,
      values: [TableName.profile, TableName.user]
    })
  
      return {data: rows, total: total?.cnt || 0}   
  }

  async findFamilyForAdmin(userId:number, connection?: PoolConnection): Promise<any> {    
    const rows = await db.query({
      connection,
      sql: `
        SELECT
          p.profileId,
          p.userId,
          u.email,
          u.password,
          p.relation,
          p.name,
          p.profilePass,
          u.phone,
          u.createdAt as userCreatedAt,
          p.createdAt as profileCreatedAt,
          (CASE 
            WHEN isParent = 1 THEN parentAmount
            WHEN isParent = 0 THEN childAmount
          END) AS amount,
          p.bankName,
          p.bankAccount
        FROM
          ?? p
        JOIN
          ?? u ON p.userId = u.userId
        WHERE
          p.isDeleted != 1 AND p.?
        ORDER BY
          p.createdAt DESC           
      `,
      values: [TableName.profile, TableName.user, {userId}]
    })  
  
    return {data: rows}   
  }

  async deleteProfile(profileId: number, connection?: PoolConnection): Promise<any> {      
      const {affectedRows} = await db.query({
        connection,
        sql: `UPDATE ?? SET isDeleted = true, deletedAt = now() WHERE ?`,
        values: [TableName.profile, {profileId}]
      })

      return affectedRows  
  }  
}

export const profileModel = new ProfileModel()