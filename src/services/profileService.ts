import {profileModel} from '../models/profile'
import {settingModel} from '../models/setting'
import {PoolConnection} from 'mysql'
import { blockService } from './blockService'
import { buddyService } from './buddyService'
import { chatService } from './chatService'

class ProfileService {
  async getProfileInfo(profileId: number, connection?: PoolConnection): Promise<any> {  
    const ret = await profileModel.findOneProfileById(profileId, connection)
    if (!ret) {
      throw new Error("프로필이 존재하지 않습니다.")
    }
    return ret
  }

  private isFamily(profileId: number, targetProfileId: number) {
    return profileId === targetProfileId
  }

  async getName(
    profileId: number, targetProfileId: number, connection?: PoolConnection
  ): Promise<any> {  
    const profile = await this.getProfileInfo(profileId, connection)
    const targetProfile = await this.getProfileInfo(targetProfileId, connection)
    const myUserId = profile.userId
    const targetUserId = targetProfile.userId
    let name = ''
    if (!this.isFamily(myUserId, targetUserId)) {
      name = await buddyService.getBuddyName(profileId, targetProfileId, connection)
    } else {
      name = await this.getFamilyName(targetProfileId, connection)
    }
    return name
  }

  /**
   * 자신을 제외한 가족 프로필 목록을 가져옵니다.
   * 가족이 프로필을 생성하지 않았다면 빈 배열을 반환합니다.
   * @param userId 
   * @param profileId 
   * @param connection 
   * @returns 
   */
  async getFamilyProfilesInfo(userId: number, profileId: number, connection?: PoolConnection): Promise<any> {  
    const families = await profileModel.findFamilyProfilesInfoExcludingUser(userId, profileId, connection)
    const blocks = await blockService.getBlocksThatBlockedByMe(profileId, connection)
    const ret = families.filter((family: any) => {
      return !blockService.hasBlockedProfile(blocks, family.profileId)
    })
    return ret
  }

  async getFamilyName(profileId: number, connection?: PoolConnection): Promise<string> {  
    const name = await profileModel.findOneFamilyNameById(profileId, connection)
    if (!name) {
      throw new Error('프로필이 존재하지 않습니다.')
    }
    return name
  }

  async putProfileInfo(profileId: number,
    options:{
      profilePass?:string,
      profileImage?:string,
      name?:string,
      bankCode?:string,
      bankName?:string,
      bankAccount?:string
      },connection?: PoolConnection
    ): Promise<any> {      
      options = Object.fromEntries(Object.entries(options).filter(([_, value]) => value != null))
      
      const ret = await profileModel.updateProfileById(profileId, options)
      if (!ret) {throw new Error("프로필 수정에 실패하였습니다.")}
      
      return ret   
  }

  async getProfileSetting(profileId: number, connection?: PoolConnection): Promise<any> {  
      const ret = await settingModel.findOneProfileSetting(profileId)
      if (!ret) {throw new Error("프로필이 존재하지 않습니다.")}
      
      return ret
  }

  async getFcmToken(profileId: number, connection?: PoolConnection): Promise<string> {
    const fcmToken = await profileModel.findOneFcmToken(profileId, connection)
    if (!fcmToken) {
      throw new Error('FCM 토큰이 존재하지 않습니다.')
    }
    return fcmToken
  }

  async putProfileSetting(profileId: number,
    options:{
      familyAlarm?: boolean,
      friendAlarm?: boolean,     
      autoFriend?: boolean,     
      },connection?: PoolConnection
    ): Promise<any> {      
      options = Object.fromEntries(Object.entries(options).filter(([_, value]) => value != null))
      
      const ret = await settingModel.updateProfileSetting(profileId, options)
      if (!ret) {throw new Error("프로필 수정에 실패하였습니다.")}
      
      return ret   
  }

  async deleteProfile(profileId: number, connection?: PoolConnection): Promise<any> {   
    const ret = await profileModel.deleteProfile(profileId)
    if (!ret) {throw new Error("프로필 삭제에 실패하였습니다.")}

    const chatRooms = await chatService.getChatRoomsByProfileId(profileId, connection)
    for (const chatRoom of chatRooms) {
      await chatService.decreaseChatUserCount(chatRoom.chatRoomId, connection)
    }
    await chatService.deleteChatUserByProfileId(profileId, connection)
    
    return ret   
  }
}

export const profileService = new ProfileService()
