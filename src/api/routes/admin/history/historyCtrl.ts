import {Response} from "express"
import {historyService} from '../../../../services/historyService'
import {db} from "../../../../loaders"
import { settlementService } from "../../../../services/settlementService"
import { paymentService } from "../../../../services/paymentService"

class HistoryCtrl {
  async getPaymentHistories(req: IRequest, res: Response, next: Function): Promise<any> {
    try {      
      const {search, startTime, endTime, order, page, perPage} = req.options
      const ret = await paymentService.getPaymentHistories({search, startTime, endTime, order, page, perPage})

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async getSettlementHistories(req: IRequest, res: Response, next: Function): Promise<any> {
    try {      
      const {startTime, endTime, order, settlementType, settlementStatus, page, perPage} = req.options
      const ret = await settlementService.getSettlementHistories({startTime, endTime, order, settlementType, settlementStatus, page, perPage})

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async putSettlementComplete(req: IRequest, res: Response, next: Function): Promise<any> {    
    try {
      const allowanceSettlementId = req.options.id      
      await settlementService.putSettlementComplete(allowanceSettlementId)
      
      res.status(200).send('success')
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async getAllowanceHistoriesAdmin(req: IRequest, res: Response, next: Function): Promise<any> {
    try {      
      const {startTime, endTime, order, page, perPage} = req.options
      const ret = await historyService.getAllowanceHistoriesAdmin({startTime, endTime, order, page, perPage})

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async getAllowanceAlbumHistoriesAdmin(req: IRequest, res: Response, next: Function): Promise<any> {
    try {      
      const {startTime, endTime, order, page, perPage} = req.options
      const ret = await historyService.getAllowanceAlbumHistoriesAdmin({startTime, endTime, order, page, perPage})

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }
  
  async getSettlementUsersDownload(req: IRequest, res: Response, next: Function): Promise<any> {
    try {
      const ret = await settlementService.getSettlementUsersDownload()   
  
      res.setHeader('Content-Disposition', `attachment; filename=${ret.fileName}.xlsx`)
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  
      res.status(200).send(ret.excelBuffer)
      
    } catch (e) {
      next(e)
    }
  }

}

export const historyCtrl = new HistoryCtrl()