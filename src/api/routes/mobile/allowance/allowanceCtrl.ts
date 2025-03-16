import {Response} from "express"
import {allowanceService} from '../../../../services/allowanceService'
import {db} from "../../../../loaders"

class AllowanceCtrl {
  async postAllowanceTask(req: IRequest, res: Response, next: Function): Promise<any> {    
    try {
      const profileId = req.profileId
      const {taskContent, taskAmount} = req.options
      await allowanceService.postAllowanceTask(profileId, {taskContent, taskAmount})
      
      res.status(200).send('success')
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async getAllowanceTasks(req: IRequest, res: Response, next: Function): Promise<any> {
    try {
      const profileId = req.profileId
      const {page, perPage} = req.options
      const ret = await allowanceService.getAllowanceTasks(profileId, {page, perPage})

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async putAllowanceTask(req: IRequest, res: Response, next: Function): Promise<any> {    
    try {
      const profileId = req.profileId
      const allowanceTaskId = req.options.id
      const {taskContent, taskAmount} = req.options
      await allowanceService.putAllowanceTask(profileId, allowanceTaskId, {taskContent, taskAmount})
      
      res.status(200).send('success')
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async deleteAllowanceTask(req: IRequest, res: Response, next: Function): Promise<any> {    
    try {
      const profileId = req.profileId
      const allowanceTaskId = req.options.id      
      await allowanceService.deleteAllowanceTask(profileId, allowanceTaskId)
      
      res.status(200).send('success')
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async postAllowanceChat(req: IRequest, res: Response, next: Function): Promise<any> {    
    const connection = await db.beginTransaction()
    try {
      const profileId = req.profileId
      const {chatRoomId, allowanceTaskId, allowanceChat, allowanceChatImage} = req.options
      await allowanceService.postAllowanceChat(chatRoomId, allowanceTaskId, {profileId, allowanceChat, allowanceChatImage}, connection)

      await db.commit(connection)
      
      res.status(200).send('success')
    } catch (e) {
      if(connection) await db.rollback(connection)
      e.status = 477
      next(e)
    }
  }

  async getAllowanceChat(req: IRequest, res: Response, next: Function): Promise<any> {
    try {      
      const allowanceChatId = req.options.id
      const ret = await allowanceService.getAllowanceChat(allowanceChatId)

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }


  async putAllowanceChatComplete(req: IRequest, res: Response, next: Function): Promise<any> {    
    const connection = await db.beginTransaction()
    try {
      const profileId = req.profileId
      const allowanceChatId = req.options.id      
      await allowanceService.putAllowanceChatComplete(profileId, allowanceChatId, connection)

      await db.commit(connection)
      
      res.status(200).send('success')
    } catch (e) {
      if(connection) await db.rollback(connection)
      e.status = 477
      next(e)
    }
  }
}

export const allowanceCtrl = new AllowanceCtrl()