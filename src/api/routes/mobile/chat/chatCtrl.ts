import {Response} from 'express'
import { chatService } from '../../../../services/chatService'
import { db } from '../../../../loaders'

class ChatCtrl {

  async getDirectChatRoom(req: IRequest, res: Response, next: Function): Promise<void> {
    const connection = await db.beginTransaction()
    try {
      const profileId: number = req.profileId 
      let {id: targetProfileId, page, perPage} = req.options
      const ret = await chatService.getDirectChatRoom(profileId, targetProfileId, {page, perPage}, connection)
      await db.commit(connection)
      res.status(200).json(ret)
    } catch (e) {
      if (connection) {
        await db.rollback(connection)
      }
      e.status = 477
      next(e)
    }
  }

  async getFamilies(req: IRequest, res: Response, next: Function): Promise<void> {
    try {
      const profileId = req.profileId 
      let {page, perPage} = req.options
      const ret = await chatService.getFamilies(profileId, {page, perPage})

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async getChatMessages(req: IRequest, res: Response, next: Function): Promise<void> {
    try {
      const profileId: number = req.profileId 
      const {id: chatRoomId, page, perPage} = req.options
      const ret = await chatService.getChatMessages(profileId, chatRoomId, {page, perPage})
      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }
}

export const chatCtrl = new ChatCtrl()