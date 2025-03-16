import { PoolConnection } from "mysql";
import { db } from "../loaders";
import TableName from "./tablename";

class ReportModel {
  async createReport(
    profileId: number, 
    reportProfileId: number, 
    reportReason: string, 
    connection?: PoolConnection
  ) {
    await db.query({
      connection,
      sql: `
        INSERT INTO ??
        SET profileId = ?,
            reportProfileId = ?,
            reportReason = ?
      `,
      values: [TableName.report, profileId, reportProfileId, reportReason]
    })
  }

  async findAllReports(profileId: number, {page, perPage}: {page: number, perPage: number}) {
    const data = await db.query({
      sql: `
        SELECT 
          r.*,
          p.profileImage as reportProfileImage
        FROM ?? r
        INNER JOIN ?? p ON r.reportProfileId = p.profileId
        WHERE r.profileId = ?
          and r.isDeleted != 1
        ORDER BY
          r.createdAt DESC
        LIMIT
          ${perPage * page - perPage}, ${perPage}       
      `,
      values: [TableName.report, TableName.profile, profileId]
    })
    return {data, total: data?.length | 0}
  }

  async deleteReport(profileId: number, reportProfileId: number, connection?: PoolConnection) {
    await db.query({
      connection,
      sql: `
        UPDATE ??
        SET isDeleted = 1
        WHERE profileId = ?
          and reportProfileId = ?
          and isDeleted != 1
      `,
      values: [TableName.report, profileId, reportProfileId]
    })
  }
}

export const reportModel = new ReportModel()