import {Response} from "express"
import {profileService} from '../../../../services/profileService'
import {db} from "../../../../loaders"

class ProfileCtrl {
  async getProfileInfo(req: IRequest, res: Response, next: Function): Promise<any> {
    try {
      const profileId = req.profileId 
      const options = req.options
      const ret = await profileService.getProfileInfo(profileId)
      await profileService.putProfileInfo(profileId, options)

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async putProfileInfo(req: IRequest, res: Response, next: Function): Promise<any> {    
    try {
      const profileId = req.profileId
      const {profilePass, profileImage, name, bankCode, bankName, bankAccount} = req.options
      await profileService.putProfileInfo(profileId, {profilePass, profileImage, name, bankCode, bankName, bankAccount})
      
      res.status(200).send('success')
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async getProfileSetting(req: IRequest, res: Response, next: Function): Promise<any> {
    try {
      const profileId = req.profileId 
      const ret = await profileService.getProfileSetting(profileId)

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async putProfileSetting(req: IRequest, res: Response, next: Function): Promise<any> {    
    try {
      const profileId = req.profileId
      const {familyAlarm, friendAlarm, autoFriend} = req.options
      await profileService.putProfileSetting(profileId, {familyAlarm, friendAlarm, autoFriend})
      
      res.status(200).send('success')
    } catch (e) {
      e.status = 477
      next(e)
    }
  }
  
  async deleteProfile(req: IRequest, res: Response, next: Function): Promise<any> {    
    try {
      const profileId = req.profileId
      await profileService.deleteProfile(profileId)
      
      res.status(200).send('success')
    } catch (e) {
      e.status = 477
      next(e)
    }
  }
}

export const profileCtrl = new ProfileCtrl()