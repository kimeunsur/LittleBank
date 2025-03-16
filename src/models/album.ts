import {PoolConnection} from 'mysql'
import {db} from '../loaders'
import TableName from './tablename'

class AlbumModel{
  async createAlbumChat(options:{
    chatMessageId:number,
    profileId: number,
    albumChat: string,
    albumAmount: number
  }, connection?: PoolConnection): Promise<any> {      
      const {insertId} = await db.query({
        connection,
        sql: `INSERT INTO ?? SET ?`,
        values: [TableName.allowanceAlbum, {...options}]
      })
      return insertId
  }

  async createAlbumIamge(allowanceAlbumId:number, albumImage:string, connection?: PoolConnection): Promise<any> {      
      const {insertId} = await db.query({
        connection,
        sql: `INSERT INTO ?? SET ?`,
        values: [TableName.allowanceAlbumImage, {allowanceAlbumId, albumImage}]
      })
      return insertId
  }

  async findOneAlbum(allowanceAlbumId: number, connection?: PoolConnection): Promise<any> { 
    const [row] = await db.query({
      connection,
      sql: `
        SELECT
          a.*,
          GROUP_CONCAT(ai.albumImage) as albumImages
        FROM
          ?? a
        LEFT JOIN
          ?? ai ON a.allowanceAlbumId = ai.allowanceAlbumId and ai.isDeleted != 1
        WHERE
          a.? AND a.isDeleted != 1`,
      values: [TableName.allowanceAlbum, TableName.allowanceAlbumImage, {allowanceAlbumId}]
    })

    return row 
  }

  async updateAlbumChat(allowanceAlbumId: number, options:{albumStatus:string, albumBuyerName:string, albumBuyerId:number, albumFee:number},connection?: PoolConnection): Promise<any> {      
      const {affectedRows} = await db.query({
        connection,
        sql: `UPDATE ?? SET ? WHERE ?`,
        values: [TableName.allowanceAlbum, {...options}, {allowanceAlbumId}]
      })

      return affectedRows
  }
  
}

export const albumModel = new AlbumModel()