import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import TableName from './tablename'

class AllowanceModel{
  async createAllowanceTask(options:{userId:number, taskContent: string, taskAmount: number},
    connection?: PoolConnection): Promise<any> {      
      const {insertId} = await db.query({
        connection,
        sql: `INSERT INTO ?? SET ?`,
        values: [TableName.allowanceTask, {...options}]
      })
      return insertId
  }

  async findOneAllowanceTask(allowanceTaskId:number, connection?: PoolConnection): Promise<any> {    
    const [row] = await db.query({
      connection,
      sql: `
        SELECT
          *
        FROM
          ??                
        WHERE
          ? AND isDeleted != 1
      `,
      values: [TableName.allowanceTask, {allowanceTaskId}]
    })

    return row  
  }

  async findAllAllowanceTasks(userId:number, options: {page: number,perPage: number}, connection?: PoolConnection): Promise<any> {
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
        ORDER BY
          createdAt DESC
        LIMIT
          ${perPage * page - perPage}, ${perPage}       
      `,
      values: [TableName.allowanceTask, {userId}]
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
      values: [TableName.allowanceTask, {userId}]
    })
  
      return {data: rows, total: total?.cnt || 0}   
  }

  async updateAllowanceTask(allowanceTaskId: number,options: {taskContent?: string, taskAmount?: number},connection?: PoolConnection    
  ): Promise<any> {      
      const {affectedRows} = await db.query({
        connection,
        sql: `UPDATE ?? SET ? WHERE ?`,
        values: [TableName.allowanceTask, {...options}, {allowanceTaskId}]
      })

      return affectedRows  
  }

  async deleteAllowanceTask(allowanceTaskId: number,connection?: PoolConnection    
  ): Promise<any> {      
      const {affectedRows} = await db.query({
        connection,
        sql: `UPDATE ?? SET isDeleted = true, deletedAt = now() WHERE ?`,
        values: [TableName.allowanceTask, {allowanceTaskId}]
      })

      return affectedRows  
  }

  async createAllowanceChat(options:{
    chatMessageId:number,
    profileId:number,
    allowanceContent:string,    
    allowanceAmount: number,
    allowanceChat:string,
    allowanceChatImage:string
  }, connection?: PoolConnection): Promise<any> {      
      const {insertId} = await db.query({
        connection,
        sql: `INSERT INTO ?? SET ?`,
        values: [TableName.allowanceChat, {...options}]
      })
      return insertId
  }

  async findOneAllowanceChat(allowanceChatId: number, connection?: PoolConnection): Promise<any> { 
    const [row] = await db.query({
      connection,
      sql: `SELECT * FROM ?? WHERE ? AND isDeleted != 1`,
      values: [TableName.allowanceChat, {allowanceChatId}]
    })

    return row 
  }

  async updateAllowanceChat(allowanceChatId: number, options:{allowanceChatStatus?:string},connection?: PoolConnection): Promise<any> {      
      const {affectedRows} = await db.query({
        connection,
        sql: `UPDATE ?? SET ? WHERE ?`,
        values: [TableName.allowanceChat, {...options}, {allowanceChatId}]
      })      

      return affectedRows  
  }
  
}

export const allowanceModel = new AllowanceModel()