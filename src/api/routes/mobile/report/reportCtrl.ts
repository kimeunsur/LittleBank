import {Response} from "express"
import { db } from "../../../../loaders"
import { reportService } from "../../../../services/reportService"

class ReportCtrl {
  async postReport(req: IRequest, res: Response, next: Function): Promise<any> {
    const connection = await db.beginTransaction()
    try {
      const profileId = req.profileId
      const {reportProfileId, reportReason} = req.options
      await reportService.postReport(profileId, reportProfileId, reportReason, connection)

      await db.commit(connection)

      res.status(200).send('success')
    } catch (e) {
      if (connection) {
        await db.rollback(connection)
      }
      e.status = 477
      next(e)
    }
  }

  async getReports(req: IRequest, res: Response, next: Function): Promise<any> {
    try {
      const profileId = req.profileId
      const {page, perPage} = req.options
      const ret = await reportService.getReports(profileId, {page, perPage})

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async deleteReport(req: IRequest, res: Response, next: Function): Promise<any> {   
    try {
      const profileId = req.profileId
      const reportProfileId = req.options.id
      await reportService.deleteReport(profileId, reportProfileId)

      res.status(200).send('success')
    } catch (e) {
      e.status = 477
      next(e)
    }
  }
}

export const reportCtrl = new ReportCtrl()