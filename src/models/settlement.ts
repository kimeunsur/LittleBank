import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import TableName from './tablename'

class SettlementModel{
  async createSettlement(options:{
    profileId: number,
    settlementType:string,
    settlementStatus:string,
    settlementAmount:number,
    settlementFee?:number
  },
    connection?: PoolConnection): Promise<number> {      
      const {insertId} = await db.query({
        connection,
        sql: `INSERT INTO ?? SET ?`,
        values: [TableName.allowanceSettlement, {...options}]
      })
      return insertId
  }

  async findSettlementById(allowanceSettlementId: number, connection?: PoolConnection): Promise<any> {
    const [rows] = await db.query({
      connection,
      sql: `SELECT * FROM ?? WHERE ?`,
      values: [TableName.allowanceSettlement, {allowanceSettlementId}]
    })

    return rows
  }
  async findAllAllSettlements(options: {startTime?: string, endTime?: string, order: string, settlementType?:string, settlementStatus?: string, page: number,perPage: number}, connection?: PoolConnection): Promise<any> {
    const {startTime, endTime, order, settlementType, settlementStatus, page, perPage} = options
    const rows = await db.query({
      connection,
      sql: `
        SELECT
          ast.allowanceSettlementId,
          ast.profileId,
          ast.settlementType,
          ast.settlementStatus,
          ast.settlementAmount,
          (ast.settlementAmount-ast.settlementFee) AS realSettlementAmount,
          ast.settlementFee,
          p.name,
          p.bankName,
          p.bankAccount,
          ast.createdAt
        FROM
          ?? ast
        JOIN
          ?? p ON ast.profileId = p.profileId
        WHERE
          ast.isDeleted != 1
          ${startTime && endTime ? `AND (ast.createdAt BETWEEN '${startTime}' AND '${endTime}')` : ''}
          ${settlementStatus ? `AND (ast.settlementStatus = '${settlementStatus}' )` : ''}
          ${settlementType ? `AND (ast.settlementType = '${settlementType}' )` : ''}
        ORDER BY
          ast.createdAt ${order}  
        LIMIT
          ${perPage * page - perPage}, ${perPage}       
      `,
      values: [TableName.allowanceSettlement, TableName.profile]
    })
  
    const [total] = await db.query({
      connection,
      sql: `
        SELECT
          COUNT(ast.allowanceSettlementId) AS cnt
        FROM
          ?? ast
        JOIN
          ?? p ON ast.profileId = p.profileId         
        WHERE
          ast.isDeleted != 1
          ${startTime && endTime ? `AND (ast.createdAt BETWEEN '${startTime}' AND '${endTime}')` : ''}
          ${settlementStatus ? `AND (ast.settlementStatus = '${settlementStatus}' )` : ''}
          ${settlementType ? `AND (ast.settlementType = '${settlementType}' )` : ''}
      `,
      values: [TableName.allowanceSettlement, TableName.profile]
    })
  
      return {data: rows, total: total?.cnt || 0}   
  }

  async findAllAllSettlementsMobile(profileId:number, options: {page: number,perPage: number}, connection?: PoolConnection): Promise<any> {
    const {page, perPage} = options
    const rows = await db.query({
      connection,
      sql: `
        SELECT
          ast.allowanceSettlementId,
          ast.profileId,
          ast.settlementType,
          ast.settlementStatus,
          ast.settlementAmount,
          (ast.settlementAmount-ast.settlementFee) AS realSettlementAmount,
          ast.settlementFee,
          p.name,
          p.bankName,
          p.bankAccount,
          ast.createdAt
        FROM
          ?? ast
        JOIN
          ?? p ON ast.profileId = p.profileId
        WHERE
          ast.isDeleted != 1 AND ast.?
        ORDER BY
          ast.createdAt DESC
        LIMIT
          ${perPage * page - perPage}, ${perPage}       
      `,
      values: [TableName.allowanceSettlement, TableName.profile, {profileId}]
    })
  
    const [total] = await db.query({
      connection,
      sql: `
        SELECT
          COUNT(ast.allowanceSettlementId) AS cnt
        FROM
          ?? ast
        JOIN
          ?? p ON ast.profileId = p.profileId         
        WHERE
          ast.isDeleted != 1 AND ast.?
      `,
      values: [TableName.allowanceSettlement, TableName.profile, {profileId}]
    })
  
      return {data: rows, total: total?.cnt || 0}   
  }

  async updateSettlement(allowanceSettlementId: number,    
    options:{
      settlementStatus?:string        
      },connection?: PoolConnection
  ): Promise<any> {      
      const {affectedRows} = await db.query({
        connection,
        sql: `UPDATE ?? SET ? WHERE ?`,
        values: [TableName.allowanceSettlement, {...options}, {allowanceSettlementId}]
      })

      return affectedRows  
  }

  async getUsersDownload(): Promise<any> {
    const rows = await db.query({
      sql: `
        SELECT
          ROW_NUMBER() OVER (ORDER BY ast.allowanceSettlementId) AS '순번',
          p.name,
          p.bankName,
          p.bankAccount,
          ast.settlementType,  
          ast.settlementStatus,
          ast.settlementAmount,
          ast.createdAt
        FROM
          ?? as ast
        JOIN
          ?? as p ON ast.profileId = p.profileId
        WHERE
          p.isDeleted != 1 AND ast.isDeleted != 1 AND ast.settlementStatus = 'pending'
          AND ast.settlementType = 'manual'
      `,
      values: [TableName.allowanceSettlement, TableName.profile]
    })    

    return {data: rows}
  }

}

export const settlementModel = new SettlementModel()