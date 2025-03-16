import {Response} from "express"
import {historyService} from '../../../../services/historyService'
import {db} from "../../../../loaders"

class HistoryCtrl {
  async getAllowanceHistoriesChild(req: IRequest, res: Response, next: Function): Promise<any> {
    try {
      const profileId = req.profileId
      const {date, page, perPage} = req.options
      const ret = await historyService.getAllowanceHistories(profileId, {date, page, perPage})

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async getAllowanceHistoriesParent(req: IRequest, res: Response, next: Function): Promise<any> {
    try {
      const profileId = req.options.id
      const {date, page, perPage} = req.options
      const ret = await historyService.getAllowanceHistories(profileId, {date, page, perPage})

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async getAllowanceHistoriesParentList(req: IRequest, res: Response, next: Function): Promise<any> {
    try {
      const profileId = req.profileId
      // const {page, perPage} = req.options
      const {date, page, perPage} = req.options
      const ret = await historyService.getAllowanceHistoriesParentList(profileId, {date, page, perPage})

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

}

export const historyCtrl = new HistoryCtrl()