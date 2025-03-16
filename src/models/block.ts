import { PoolConnection } from "mysql"
import { db } from "../loaders"
import TableName from "./tablename"

class BlockModel {
  async createBlock(profileId: number, blockProfileId: number, connection?: PoolConnection): Promise<number> {
    const {insertId} = await db.query({
      connection,
      sql: `
        INSERT INTO ??
        SET ?
      `,
      values: [TableName.block, {profileId, blockProfileId}]
    })
    return insertId
  }

  async findAllBlocksUsingPaging(profileId: number, options: {page: number,perPage: number}, connection?: PoolConnection): Promise<any> {
    const {page, perPage} = options
    const data = await db.query({
      connection,
      sql: `
        SELECT 
          b.*,
          p.profileImage as blockProfileImage
        FROM ?? b
        INNER JOIN ?? p ON b.blockProfileId = p.profileId
        WHERE b.profileId = ?
          and b.isDeleted != 1
        ORDER BY
          b.createdAt DESC
        LIMIT
          ${perPage * page - perPage}, ${perPage}       
      `,
      values: [TableName.block, TableName.profile, profileId]
    })
    return {data, total: data?.length || 0}   
  }

  async findBlocksThatBlockedByMe(profileId: number, connection?: PoolConnection): Promise<any> {
    return await db.query({
      connection,
      sql: `
        SELECT 
          *
        FROM ??
        WHERE ?
          and isDeleted != 1
        ORDER BY
          createdAt DESC
      `,
      values: [TableName.block, {profileId}]
    })
  }

  async findAllBlocksThatBlockMe(blockProfileId: number, connection?: PoolConnection): Promise<any> {
    return await db.query({
      connection,
      sql: `
        SELECT 
          *
        FROM ??
        WHERE
          blockProfileId = ?
          and isDeleted != 1
        ORDER BY
          createdAt DESC
      `,
      values: [TableName.block, blockProfileId]
    })
  }

  async findOneBlock(profileId: number, blockProfileId: number, connection?: PoolConnection): Promise<any> {
    const [row] = await db.query({
      connection,
      sql: `
        SELECT 
          *
        FROM ??
        WHERE ?
          and ?
          and isDeleted != 1
        ORDER BY
          createdAt DESC
      `,
      values: [TableName.block, {profileId}, {blockProfileId}]
    })
    return row
  }
  
  async deleteBlock(profileId: number, blockProfileId: number, connection?: PoolConnection): Promise<any> {
    return await db.query({
      connection,
      sql: `
        UPDATE ??
        SET isDeleted = 1,
            deletedAt = NOW()
        WHERE ?
          and ?
          and isDeleted != 1
      `,
      values: [TableName.block, {profileId}, {blockProfileId}]
    })
  }
}

export const blockModel = new BlockModel()