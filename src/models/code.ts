import { PoolConnection } from "mysql"
import {db} from '../loaders'
import TableName from './tablename'

class CodeModel {
  async findAll(connection?: PoolConnection) {
    const rows = await db.query({
      connection,
      sql: `
        SELECT
          *
        FROM
          ?? 
        WHERE isdeleted = 0          
      `,
      values: [TableName.codeBank]
    })
  
    return {data : rows}
  }
}

export const codeModel = new CodeModel()