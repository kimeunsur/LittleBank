import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import TableName from './tablename'

class MissionModel{
  async createMissionChat(options:{
    chatMessageId:number,
    profileId:number,
    missionChat:string,
    missionAmount:number,
    missionStartDate:string,
    missionEndDate:string,
    missionParentComment:string,
    missionParentImage:string   
  }, connection?: PoolConnection): Promise<any> {      
      const {insertId} = await db.query({
        connection,
        sql: `INSERT INTO ?? SET ?`,
        values: [TableName.allowanceMission, {...options}]
      })
      return insertId
  }  

  async findOneMission(allowanceMissionId: number, connection?: PoolConnection): Promise<any> { 
    const [row] = await db.query({
      connection,
      sql: `SELECT * FROM ?? WHERE ? AND isDeleted != 1`,
      values: [TableName.allowanceMission, {allowanceMissionId}]
    })

    return row 
  }

  async updateMissionChat(
    allowanceMissionId:number,
    options:{    
    missionChat?:string,
    missionAmount?:number,
    missionStartDate?:string,
    missionEndDate?:string,
    missionParentComment?:string,
    missionParentImage?:string,
    childProfileId?:number,
    missionStatus?:string,
    missionChildComment?:string,
    missionChildImage?:string
  }, connection?: PoolConnection): Promise<any> {      
      const {affectedRows} = await db.query({
        connection,
        sql: `UPDATE ?? SET ? WHERE ? `,
        values: [TableName.allowanceMission, {...options}, {allowanceMissionId}]
      })
      return affectedRows
  }  

  async deleteMissionChat(allowanceMissionId:number,connection?: PoolConnection    
  ): Promise<any> {    
      const {affectedRows} = await db.query({
        connection,
        sql: `UPDATE ?? SET isDeleted = true, deletedAt = now() WHERE ? `,
        values: [TableName.allowanceMission, {allowanceMissionId}]
      })

      return affectedRows  
  }
}

export const missionModel = new MissionModel()