import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import TableName from './tablename'

class AppVersionModel{  
  async getVersions(connection?: PoolConnection): Promise<any> { 
    const rows: [any] = await db.query({
      connection,
      sql: `
        SELECT
          deviceType,
          compulVersion,
          optVersion
        FROM ??
      `,
      values: [TableName.appVersion]
    })
    return rows 
  }
}

export const appVersionModel = new AppVersionModel()