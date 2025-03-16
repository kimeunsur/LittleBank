import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import TableName from './tablename'

class SettingModel{
  async createSetting(profileId: number, connection?: PoolConnection) {  
    const {insertId} = await db.query({
      connection,
      sql: `INSERT INTO ?? SET ?`,
      values: [TableName.userSetting, {profileId}]
    })

    return insertId 
  }

  async findOneProfileSetting(profileId: number, connection?: PoolConnection): Promise<any> {
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
      values: [TableName.userSetting, {profileId}]
    })

    return row   
  }

  async updateProfileSetting(profileId: number,
    options:{
      familyAlarm?: boolean,
      friendAlarm?: boolean,     
      autoFriend?: boolean,     
      },connection?: PoolConnection
    ): Promise<any> {
      
      const {affectedRows} = await db.query({
        connection,
        sql: `
          UPDATE ?? SET ? WHERE ?
        `,
        values: [TableName.userSetting, {...options}, {profileId}]
      })    
  
      return affectedRows   
  }

  async findAdminSetting(connection?: PoolConnection): Promise<any> {
    const rows = await db.query({
      connection,
      sql: `
        SELECT
          *
        FROM
          ??       
        WHERE
          isDeleted != 1
      `,
      values: [TableName.adminSetting]
    })

    return {data:rows}
  }

  async updateAdminSetting(adminSettingId: number,    
    options:{
      pointFee?:number,
      depositFee?:number,
      depositFeeMin?:number,
      sellingFee?:number,
      sellingFeeMin?:number,
      url?: string,
      },connection?: PoolConnection
  ): Promise<any> {      
      const {affectedRows} = await db.query({
        connection,
        sql: `UPDATE ?? SET ? WHERE ?`,
        values: [TableName.adminSetting, {...options}, {adminSettingId}]
      })

      return affectedRows  
  }  
}

export const settingModel = new SettingModel()