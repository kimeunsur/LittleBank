import {Response} from "express"
import {missionService} from '../../../../services/missionService'
import {db} from "../../../../loaders"

class MissionCtrl {
  async postMissionChat(req: IRequest, res: Response, next: Function): Promise<any> { 
    const connection = await db.beginTransaction()
    try {
      const profileId = req.profileId
      const {chatRoomId, missionChat, missionAmount, missionStartDate, missionEndDate, missionParentComment, missionParentImage} = req.options
      await missionService.postMissionChat(profileId, chatRoomId, {missionChat, missionAmount, missionStartDate, missionEndDate, missionParentComment, missionParentImage})      

      await db.commit(connection)
      
      res.status(200).send('success')
    } catch (e) {      
      if (connection) {
        await db.rollback(connection)
      }
      e.status = 477
      next(e)
    }
  }

  async getMissionChat(req: IRequest, res: Response, next: Function): Promise<any> {
    try {      
      const allowanceMissionId = req.options.id
      const profileId = req.profileId
      const ret = await missionService.getMissionChat(allowanceMissionId, profileId)

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async putMissionChat(req: IRequest, res: Response, next: Function): Promise<any> { 
    try {
      const profileId = req.profileId
      const allowanceMissionId = req.options.id
      const {missionChat, missionAmount, missionStartDate, missionEndDate, missionParentComment, missionParentImage} = req.options
      await missionService.putMissionChat(profileId, allowanceMissionId, {missionChat, missionAmount, missionStartDate, missionEndDate, missionParentComment, missionParentImage})      
      
      res.status(200).send('success')
    } catch (e) {      
      e.status = 477
      next(e)
    }
  }

  async putMissionChatRequest(req: IRequest, res: Response, next: Function): Promise<any> { 
    const connection = await db.beginTransaction()
    try {
      const profileId = req.profileId
      const allowanceMissionId = req.options.id      
      await missionService.putMissionChatRequest(profileId, allowanceMissionId, connection)      

      await db.commit(connection)
      
      res.status(200).send('success')
    } catch (e) {      
      if(connection) await db.rollback(connection)
      e.status = 477
      next(e)
    }
  }  

  async putMissionChatAssign(req: IRequest, res: Response, next: Function): Promise<any> { 
    const connection = await db.beginTransaction()
    try {
      const profileId = req.profileId
      const allowanceMissionId = req.options.id      
      await missionService.putMissionChatAssign(profileId, allowanceMissionId, connection)      

      await db.commit(connection)
      
      res.status(200).send('success')
    } catch (e) {      
      if(connection) await db.rollback(connection)
      e.status = 477
      next(e)
    }
  }

  async putMissionChatChildComplete(req: IRequest, res: Response, next: Function): Promise<any> { 
    const connection = await db.beginTransaction()
    try {
      const profileId = req.profileId
      const allowanceMissionId = req.options.id
      const {missionChildComment, missionChildImage} = req.options
      await missionService.putMissionChatChildComplete(profileId, allowanceMissionId, {missionChildComment, missionChildImage}, connection)      

      await db.commit(connection)
      
      res.status(200).send('success')
    } catch (e) {      
      if(connection) await db.rollback(connection)
      e.status = 477
      next(e)
    }
  }

  async putMissionChatComplete(req: IRequest, res: Response, next: Function): Promise<any> { 
    const connection = await db.beginTransaction()
    try {
      const profileId = req.profileId
      const allowanceMissionId = req.options.id      
      await missionService.putMissionChatComplete(profileId, allowanceMissionId, connection)      

      await db.commit(connection)
      
      res.status(200).send('success')
    } catch (e) {      
      if(connection) await db.rollback(connection)
      e.status = 477
      next(e)
    }
  }

  async deleteMissionChat(req: IRequest, res: Response, next: Function): Promise<any> {       
    try {
      const profileId = req.profileId
      const allowanceMissionId = req.options.id      
      await missionService.deleteMissionChat(profileId, allowanceMissionId)     
            
      res.status(200).send('success')
    } catch (e) {      
      e.status = 477
      next(e)
    }
  }
 
}

export const missionCtrl = new MissionCtrl()