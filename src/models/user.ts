import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import TableName from './tablename'

class UserModel {
  async createUser(options:{
    email: string,    
    password: string,      
    phone: string,
    socialId: string
  }, connection?: PoolConnection): Promise<any> {  
      const {insertId} = await db.query({
        connection,
        sql: `INSERT INTO ?? SET ?`,
        values: [TableName.user, {...options}]
      })
      return insertId
  }

  async findOneUserByEmail(email: string, connection?: PoolConnection): Promise<any> { 
      const [row] = await db.query({
        connection,
        sql: `SELECT * FROM ?? WHERE ? AND isDeleted != 1`,
        values: [TableName.user, {email}]
      })

      return row 
  } 

  async updateUserById(
    userId: number,
    options: {    
      status?: string,
      phone?: string,
      socialId?: string,
      danalImpUid?: string
    },
    connection?: PoolConnection
  ): Promise<any> {
        
      const {affectedRows} = await db.query({
        connection,
        sql: `UPDATE ?? SET ? WHERE ?`,
        values: [TableName.user, {...options}, {userId}]
      })

      return affectedRows  
  }

  async deleteUser(userId: number, connection?: PoolConnection): Promise<any> {      
    const {affectedRows} = await db.query({
      connection,
      sql: `
        UPDATE
          ?? u
        JOIN
          ?? p ON p.userId = u.userId
        SET
          u.isDeleted = true, u.deletedAt = now(),
          p.isDeleted = true, p.deletedAt = now()
        WHERE
          u.?`,
      values: [TableName.user, TableName.profile, {userId}]
    })

    return affectedRows  
 }  
}

export const userModel = new UserModel()