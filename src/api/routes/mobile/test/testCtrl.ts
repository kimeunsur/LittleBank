import {Response} from 'express'
import {authService} from '../../../../services/authService'
import {db} from '../../../../loaders'
import {iamportManager} from '../../../../libs/iamportManager'
import { settlementService } from '../../../../services/settlementService'

class TestCtrl {
  async testt(req: IRequest, res: Response, next: Function): Promise<void> {    
    try {
      // const imp_uid = 'imp_810772926531'
      // const imp_uid = 'imp_401932948909'
      
      // const dd = await iamportManager.getCertifications({imp_uid})
      const ret = await settlementService.getBankTransferBalance(1) 
      res.status(200).json(ret)
      
      // res.status(200).send('success')
    } catch (e) {      
      e.status = 477
      next(e)
    }
  }
}

export const testCtrl = new TestCtrl()