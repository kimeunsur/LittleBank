import {Response} from "express"
import {buddyService} from '../../../../services/buddyService'
import {db} from "../../../../loaders"

class BuddyCtrl {
  async postBuddy(req: IRequest, res: Response, next: Function): Promise<any> {
    const connection = await db.beginTransaction()   
    try {
      const profileId = req.profileId
      const {buddyProfileId, buddyNameMy, buddyNameYou} = req.options
      await buddyService.postBuddy(profileId, buddyProfileId, buddyNameMy, buddyNameYou, connection)

      await db.commit(connection)
      
      res.status(200).send('success')
    } catch (e) {
      if(connection) await db.rollback(connection)
      e.status = 477
      next(e)
    }
  }

  async getBuddies(req: IRequest, res: Response, next: Function): Promise<any> {
    try {
      const profileId = req.profileId
      const {page, perPage} = req.options
      const ret = await buddyService.getBuddies(profileId, {page, perPage})

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async getBuddySearch(req: IRequest, res: Response, next: Function): Promise<any> {
    try {
      const profileId = req.profileId
      const {email, page, perPage} = req.options
      const ret = await buddyService.getBuddySearch(profileId, {email, page, perPage})

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  /**
   * 친구들의 미션/용돈 이체완료 피드 조회
   * @param req 
   * @param res 
   * @param next 
   */
  async getBuddiesNews(req: IRequest, res: Response, next: Function): Promise<any> {
    try {
      const profileId = req.profileId
      const {page, perPage} = req.options
      const ret = await buddyService.getBuddiesNews(profileId, {page, perPage})

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }
  

  async putBuddy(req: IRequest, res: Response, next: Function): Promise<any> {    
    try {
      const profileId = req.profileId
      const buddyProfileId = req.options.id
      const {buddyName} = req.options
      await buddyService.putBuddy(profileId, buddyProfileId, buddyName)
      
      res.status(200).send('success')
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async deleteBuddy(req: IRequest, res: Response, next: Function): Promise<any> {   
    const connection = await db.beginTransaction() 
    try {
      const profileId = req.profileId
      const buddyProfileId = req.options.id      
      await buddyService.deleteBuddy(profileId, buddyProfileId, connection)

      await db.commit(connection)
      
      res.status(200).send('success')
    } catch (e) {
      if(connection) await db.rollback(connection)
      e.status = 477
      next(e)
    }
  }
}

export const buddyCtrl = new BuddyCtrl()