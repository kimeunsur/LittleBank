import {Response} from 'express'
import {adminService} from '../../../../services/adminService'

class AuthCtrl {
  async getAuth(req: IRequest, res: Response, next: Function): Promise<any> {
    try {
      await adminService.findOneAdminById(req.session.adminId)

      res.status(200).send('success')
    } catch (e) {
      e.status = 498
      next(e)
    }
  }

  async postAdmin(req: IRequest, res: Response, next: Function): Promise<void> {
    try {
      const {adminName, email, password} = req.options
      await adminService.postAdmin({adminName, email, password})    
      
      res.status(200).send('success')
    } catch (e) {
      e.status = 477    
      next(e)
    }
  }

  async postAuth(req: IRequest, res: Response, next: Function): Promise<void> {
    try {
      const {email, password} = req.options

      const ret = await adminService.postAuth({email, password})
    
      req.session.adminId = ret.adminId
      req.session.type = 'admin'
      req.session.clientIp = req.clientIp
      req.session.useragent = req.headers['user-agent']   
      
      res.status(200).json(ret)
    } catch (e) {
      e.status = 477    
      next(e)
    }
  }

  async deleteAuth(req: IRequest, res: Response, next: Function): Promise<void> {
    try {
      if (req.session) {
        req.session.destroy((e) => res.status(200).send('success'))
      } else res.status(200).send('success')
    } catch (e) {
      e.status = 477
      next(e)
    }
  }
}

export const authCtrl = new AuthCtrl()