import { PoolConnection } from "mysql";
import { reportModel } from "../models/report";
import { profileService } from "./profileService";

class ReportService {
  async postReport(
    profileId: number, 
    reportProfileId: number, 
    reportReason: string, 
    connection?: PoolConnection
  ) {
    if (profileId === reportProfileId) {
      throw new Error('자기 자신을 신고할 수 없습니다')
    }
    const reportProfile = await profileService.getProfileInfo(reportProfileId, connection)
    if (!reportProfile) {
      throw new Error('존재하지 않는 프로필입니다')
    }

    await reportModel.createReport(profileId, reportProfileId, reportReason, connection)
  }

  async getReports(profileId: number, {page, perPage}: {page: number, perPage: number}) {
    return await reportModel.findAllReports(profileId, {page, perPage})
  }

  async deleteReport(profileId: number, reportProfileId: number, connection?: PoolConnection) {
    await reportModel.deleteReport(profileId, reportProfileId, connection)
  }
}

export const reportService = new ReportService()