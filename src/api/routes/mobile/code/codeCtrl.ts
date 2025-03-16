import {Response} from 'express'
import { codeService } from '../../../../services/codeService'

class CodeCtrl {

  async getCodeBank(req: IRequest, res: Response, next: Function): Promise<void> {
    try {   
      const ret = await codeService.getCodeBank()

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }
}

export const codeCtrl = new CodeCtrl()