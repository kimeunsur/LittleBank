import {Response} from "express"
import {adminService} from '../../../../services/adminService'

class SettingCtrl {
  async getSetting(req: IRequest, res: Response, next: Function): Promise<any> {
    try {      
      const ret = await adminService.getSetting()

      res.status(200).json(ret.data[0])
    } catch (e) {
      e.status = 477
      next(e)
    }
  }
}

export const settingCtrl = new SettingCtrl()