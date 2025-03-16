import {Response} from "express"
import {settlementService} from '../../../../services/settlementService'
import {db} from "../../../../loaders"

class SettlementCtrl {
  async postSettlement(req: IRequest, res: Response, next: Function): Promise<any> {
    const connection = await db.beginTransaction()
    try {
      const profileId = req.profileId      
      const {settlementType, settlementAmount} = req.options
      await settlementService.postSettlement(profileId, {settlementType, settlementAmount}, connection)

      await db.commit(connection)
      
      res.status(200).send('success')
    } catch (e) {
      if(connection) await db.rollback(connection)
      e.status = 477
      next(e)
    }
  }

  async getSettlements(req: IRequest, res: Response, next: Function): Promise<any> {
    try {
      const profileId = req.profileId 
      const {page, perPage} = req.options
      const ret = await settlementService.getSettlementsMobile(profileId, {page, perPage})

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }
}

export const settlementCtrl = new SettlementCtrl()