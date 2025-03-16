import {code as Code, jwt as JWT} from '../libs'
import {profileModel} from '../models/profile'
import {settingModel} from '../models/setting'
import {userModel} from '../models/user'
import {PoolConnection} from 'mysql'
import { chatService } from './chatService'
import { DocDB } from 'aws-sdk'
import { iamportManager } from '../libs/iamportManager'

class AuthService {
  /**
   * 가족계정 회원가입
   * @param options 
   * @param connection 
   * @returns 
   */
  async postUser(options:{
      email:string,
      password:string,
      phone:string,
      socialId:string     
    }, connection?: PoolConnection): Promise<any> {

      const {email} = options
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error('이메일 형식이 올바르지 않습니다.')
      }
      const length = email.length
      if (length > 50) {
        throw new Error('이메일은 50자 이하로 입력해주세요.')
      }
    
      const checkEmail = await userModel.findOneUserByEmail(email, connection)
      if(checkEmail) {throw new Error('중복된 이메일 입니다.')}
      
      const ret = await userModel.createUser({
        email: options.email,    
        password: options.password,      
        phone: options.phone,
        socialId: options.socialId
      }, connection)
      if(!ret) {throw new Error('계정 생성에 실패하였습니다.')}

      const user = await userModel.findOneUserByEmail(options.email, connection)
      if (!user) {throw new Error('계정 생성에 실패하였습니다.')}
      
      const reqRole = 'user'
      const userId = user.userId
      const status = user.status
      const userAccessToken = await JWT.createAccessToken(userId, reqRole)      
      return {userId, status, userAccessToken} 
  }

  async postProfile(options:{
    userId:number, 
    profilePass:string,  
    name:string, 
    relation:string,
    fcmToken?:string,
    profileImage?:string,
    bankCode?: string,
    bankName?:string,
    bankAccount?:string
  }, connection?: PoolConnection): Promise<any> {
    const checkName = await profileModel.findOneProfileByName(options.userId, options.name, connection)
    if(checkName) {throw new Error('중복된 이름 입니다.')}

    options.relation === 'child' ? options['isParent'] = false : options['isParent'] = true
    options['accountInfo'] = JSON.stringify({salt: Code.generateRandomHash(64)})  

    const createCheck = await profileModel.createProfile(options, connection)
    if(!createCheck) {throw new Error('프로필 생성에 실패하였습니다.')}
      
    const profile = await profileModel.findOneProfileByName(options.userId, options.name, connection)
    if(!profile) {throw new Error('프로필 생성에 실패하였습니다.')}
    const createSetting = await settingModel.createSetting(profile.profileId, connection)
    if(!createSetting) {throw new Error('프로필 생성에 실패하였습니다.')}
    const refreshToken = await JWT.createRefreshToken({profileId: profile.profileId}, profile.accountInfo.salt)
    if(!refreshToken) {throw new Error('프로필 생성에 실패하였습니다.')}

    const ret = await profileModel.updateProfileById(profile.profileId, {refreshToken}, connection)
    if(!ret) {throw new Error('프로필 생성에 실패하였습니다.')}

    await chatService.enterFamilyChatRoom(options.userId, profile.profileId, connection)
    return ret
  }

  /**
   * 가족계정 로그인
   * @param options 
   * @returns 
   */
  async postAuth(options: {email: string; password: string}): Promise<Dictionary> { 
      const ret = await userModel.findOneUserByEmail(options.email)
      if (!ret) {throw new Error('로그인 정보가 올바르지 않습니다.')}

      if(ret.password !== options.password) {throw new Error('로그인 정보가 올바르지 않습니다.')}     

      const reqRole = 'user'
      const userAccessToken = await JWT.createAccessToken(ret.userId, reqRole)      

      return {userId : ret.userId, status : ret.status, userAccessToken} 
  }

  async postAuthProfile(profileId:number): Promise<Dictionary> {   
    const ret = await profileModel.findOneProfileById(profileId)
    if (!ret) {throw new Error('다시 로그인 해주세요.')}

    const reqRole = 'profile'
    const accessToken = await JWT.createAccessToken(ret.profileId, reqRole)
    const refreshToken = await JWT.createRefreshToken({profileId: ret.profileId}, ret.accountInfo.salt)

    return {profileId : ret.profileId, userId : ret.userId, isParent:ret.isParent, accessToken, refreshToken} 
  }

  async refreshToken(refreshToken: string, fcmToken?:string, connection?: PoolConnection): Promise<string> {      
      if (!refreshToken || !fcmToken) {throw new Error('empty_token')}
      const ref = await profileModel.findOneProfileByRef(refreshToken)    
      if(!ref) {throw new Error('invalid_refresh_token')}

      const { profileId, accountInfo: {salt: refreshHash} } = ref

      try{
        await JWT.decodeTokenRefresh(refreshToken, {algorithms: ['HS256']}, refreshHash)
      } catch (e) {
        throw new Error('invalid_refresh_token')
      }

      if(fcmToken) profileModel.updateProfileById(profileId, {fcmToken})
      const reqRole = 'profile'      
      const newAccessToken = await JWT.createAccessToken(profileId, reqRole)    
      
      return newAccessToken  
  }

  async getAuthProfiles(userId: number, options:{page: number, perPage: number},connection?: PoolConnection): Promise<void> {  
    const ret = await profileModel.findFamilyProfiles(userId, options)
    ret.userId = userId    
    
    return ret   
  }

  async deleteUser(userId: number, profileId: number, connection?: PoolConnection): Promise<any> {
    if(userId) {
      const ret = await userModel.deleteUser(userId)
      if (!ret) {throw new Error("회원 탈퇴에 실패하였습니다.")}         
      return ret
    } else if(profileId) {
      const profile = await profileModel.findOneProfileById(profileId, connection)
      if (!profile) {throw new Error("회원 탈퇴에 실패하였습니다.")}         
      const ret = await userModel.deleteUser(profile.userId)
      if (!ret) {throw new Error("회원 탈퇴에 실패하였습니다.")}         
      return ret
    } else {
      throw new Error ("회원 탈퇴에 실패하였습니다.")
    }
  }

  async postCertifications(options:{
    name: string,
    phone: string,
    birth: string,
    gender_digit: string,
    carrier: string,
    is_mvno: boolean   
  }, connection?: PoolConnection): Promise<any> {

    const danalImpUid = await iamportManager.postCertifications(options)

    return danalImpUid
  }

  async postCertificationConfrim(options:{
    imp_uid: string,
    otp: string  
  }, connection?: PoolConnection): Promise<any> {

    await iamportManager.postCertificationConfrim(options)

    return
  }
}

export const authService = new AuthService()
