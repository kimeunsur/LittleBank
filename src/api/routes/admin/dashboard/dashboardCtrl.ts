import {Response} from "express"
import {dashboardService} from '../../../../services/dashboardService'
import {db} from "../../../../loaders"

class DashboardCtrl {
  async getDash(req: IRequest, res: Response, next: Function): Promise<any> {
    try {
      const date = req.options.param
      const ret = await dashboardService.getDash(date)

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async getBalance(req: IRequest, res: Response, next: Function): Promise<any> {
    try {      
      const ret = await dashboardService.getBalance()

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }
}

export const dashboardCtrl = new DashboardCtrl()