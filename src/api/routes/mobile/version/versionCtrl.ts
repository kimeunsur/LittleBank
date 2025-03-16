import {Response} from 'express'
import {appVersionModel} from '../../../../models/appVersion'

class AppVersionCtrl {
  async getVersions(req: IRequest, res: Response, next: Function): Promise<void> {
    try {
      const result = await appVersionModel.getVersions()      
      
      res.status(200).json(result)
    } catch (e) {
      next(e)
    }
  }
}

export const appVersionCtrl = new AppVersionCtrl()