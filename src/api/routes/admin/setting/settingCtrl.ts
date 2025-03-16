import {Response} from "express"
import {adminService} from '../../../../services/adminService'
import {db} from "../../../../loaders"

class SettingCtrl {
  async getSetting(req: IRequest, res: Response, next: Function): Promise<any> {
    try {      
      const ret = await adminService.getSetting()

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async putSetting(req: IRequest, res: Response, next: Function): Promise<any> {    
    try {
      const adminSettingId = req.options.id
      const {pointFee, depositFee, depositFeeMin, sellingFee, sellingFeeMin, url} = req.options
      await adminService.putSetting(adminSettingId, {pointFee, depositFee, depositFeeMin, sellingFee, sellingFeeMin, url})
      
      res.status(200).send('success')
    } catch (e) {
      e.status = 477
      next(e)
    }
  }
}

export const settingCtrl = new SettingCtrl()