import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import TableName from './tablename'

class AdminModel{
  async createAdmin(options: {email: string; password: string}, connection?: PoolConnection): Promise<any> {   
      const {insertId} = await db.query({
        connection,
        sql: `INSERT INTO ?? SET ?`,
        values: [TableName.admin, {...options}]
      })
      return insertId
   
  }

  async findOneAdminById(adminId: number, connection?: PoolConnection): Promise<any> {  
      const [row] = await db.query({
        connection,
        sql: `SELECT * FROM ?? WHERE ? AND isDeleted != 1`,
        values: [TableName.admin, {adminId}]
      })
  
      return row   
  }

  async findOneAdminByEmail(email: string,  connection?: PoolConnection): Promise<any> {  
    const [row] = await db.query({
      connection,
      sql: `SELECT * FROM ?? WHERE ? AND isDeleted != 1`,
      values: [TableName.admin, {email}]
    })

    return row   
 }  
  
}

export const adminModel = new AdminModel()