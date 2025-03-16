import {Response} from "express"
import {userService} from '../../../../services/userService'
import {db} from "../../../../loaders"

class UserCtrl {
  async getUsers(req: IRequest, res: Response, next: Function): Promise<any> {
    try {      
      const {search, order, page, perPage} = req.options
      const ret = await userService.getUsers({search, order, page, perPage})

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async getUser(req: IRequest, res: Response, next: Function): Promise<any> {
    try {      
      const userId = req.options.id
      const ret = await userService.getUser(userId)

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }
}

export const userCtrl = new UserCtrl()