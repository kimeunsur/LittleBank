import {Response} from 'express'
import {authService} from '../../../../services/authService'
import {db} from '../../../../loaders'

class AuthCtrl {
  /**
   * 가족계정 회원가입
   * @param req 
   * @param res 
   * @param next 
   */
  async postUser(req: IRequest, res: Response, next: Function): Promise<void> {
    const connection = await db.beginTransaction()
    try {
      const {email, password, phone, socialId} = req.options

      const ret = await authService.postUser({email, password, phone, socialId}, connection)

      await db.commit(connection)
      
      res.status(200).json(ret)
    } catch (e) {
      if(connection) await db.rollback(connection)
      e.status = 477
      next(e)
    }
  }

  async postProfile(req: IRequest, res: Response, next: Function): Promise<void> {
    const connection = await db.beginTransaction()
    try {      
      const userId = req.userId
      const {fcmToken, profilePass, profileImage, name, bankCode, bankName, bankAccount, relation} = req.options

      await authService.postProfile({userId, profilePass, name, relation, fcmToken, profileImage, bankCode, bankName, bankAccount,}, connection)

      await db.commit(connection)
      
      res.status(200).send('success')
    } catch (e) {
      if(connection) await db.rollback(connection)    
      e.status = 477    
      next(e)
    }
  }

  /**
   * 가족계정 로그인
   * @param req 
   * @param res 
   * @param next 
   */
  async postAuth(req: IRequest, res: Response, next: Function): Promise<void> {  
    try {
      const {email, password} = req.options
      const ret = await authService.postAuth({email, password})    
      
      res.status(200).json(ret)
    } catch (e) {    
      e.status = 477   
      next(e)
    }
  }

  async postAuthProfile(req: IRequest, res: Response, next: Function): Promise<void> {  
    try {    
      const ret = await authService.postAuthProfile(req.options.id)    
      
      res.status(200).json(ret)
    } catch (e) {        
      e.status = 477     
      next(e)
    }
  }

  async postAuthRefresh(req: IRequest, res: Response, next: Function): Promise<void> {  
    try {
      const {refreshToken, fcmToken} = req.options
      const newAccessToken = await authService.refreshToken(refreshToken, fcmToken)    
      
      res.status(200).json({accessToken: newAccessToken, refreshToken})
    } catch (e) {        
      if (e.message === 'invalid_token') e.status = 401    
      else if (e.message === 'invalid_refresh_token') e.status = 499
      else if (e.message === 'empty_token') e.status = 400
      next(e)
    }
  }

  async getAuthProfiles(req: IRequest, res: Response, next: Function): Promise<any> {
    try {
      const userId = req.userId
      const {page, perPage} = req.options
      const ret = await authService.getAuthProfiles(userId, {page, perPage})

      res.status(200).json(ret)
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async deleteUser(req: IRequest, res: Response, next: Function): Promise<any> {    
    try {
      const userId = req.userId
      const profileId = req.profileId
      await authService.deleteUser(userId, profileId)
      
      res.status(200).send('success')
    } catch (e) {
      e.status = 477
      next(e)
    }
  }

  async postCertifications(req: IRequest, res: Response, next: Function): Promise<void> {    
    try {      
      const {name, phone, birth, genderDigit, carrier, isMvno} = req.options

      const ret = await authService.postCertifications({name, phone, birth, gender_digit:genderDigit, carrier, is_mvno:isMvno})   
      
      res.status(200).json(ret)
    } catch (e) {    
      e.status = 477    
      next(e)
    }
  }

  async postCertificationConfrim(req: IRequest, res: Response, next: Function): Promise<void> {    
    try {      
      const {danalImpUid, otp} = req.options

      await authService.postCertificationConfrim({imp_uid:danalImpUid, otp})   
      
      res.status(200).send('success')
    } catch (e) {    
      e.status = 477    
      next(e)
    }
  }
}

export const authCtrl = new AuthCtrl()