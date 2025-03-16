import {buddyModel} from '../models/buddy'
import {PoolConnection} from 'mysql'
import { profileModel } from '../models/profile'
import { profileService } from './profileService'

class BuddyService {
  /**
   * 
   * @param buddies 방에 있는 친구 목록
   * @param targetProfileId follwerId와 같은지를 확인하며 친구가 설정한 이름을 가져옵니다.
   * @returns 
   */
  getCustomName(buddies, myProfileId: number) { // 내가 followingId인 buddies 목록
    for (const buddy of buddies) {
      if (buddy.followingId === myProfileId) {
      // if (buddy.followerId === targetProfileId) { // 따져보고 수정해야함
        return buddy.buddyName
      }
    }
    throw new Error('친구로 등록 되어 있지 않습니다.')
  }
  
  async postBuddy(profileId:number, buddyProfileId:number, buddyNameMy:string, buddyNameYou:string,connection?: PoolConnection): Promise<any> {    
    const buddyStatus = "buddy" // 친구 요청 on/off 기획 확정 대기
    if (profileId === buddyProfileId) {throw new Error('자기 자신을 친구로 등록할 수 없습니다.')}
    const isFriend = await buddyModel.isFriedship(profileId, buddyProfileId)
    if (isFriend) {throw new Error('이미 친구로 등록되어 있습니다.')}
    
    const profile = await profileService.getProfileInfo(profileId, connection)
    const buddyProfile = await profileService.getProfileInfo(buddyProfileId, connection)
    if (profile.userId === buddyProfile.userId) {throw new Error('가족은 친구로 등록할 수 없습니다.')}

    const retMy = await buddyModel.createBuddy({followerId:profileId, followingId:buddyProfileId, buddyName:buddyNameMy, buddyStatus}, connection)
    if (!retMy) {throw new Error('친구 신청에 실패하였습니다.')}
    const ret = await buddyModel.createBuddy({followerId:buddyProfileId, followingId:profileId, buddyName:buddyNameYou, buddyStatus}, connection)
    if (!ret) {throw new Error('친구 신청에 실패하였습니다.')}
  }

  async getBuddyName(
    profileId: number, targetProfileId: number, connection?: PoolConnection
  ): Promise<any> {
    const ret = await buddyModel.findBuddyName(
      {followerId: profileId, followingId: targetProfileId}, connection
    )
    if (!ret) {
      throw new Error('서로 친구 관계가 아닙니다.')
    }
    return ret.buddyName
  }

  async getBuddies(profileId: number, options:{page: number, perPage: number},connection?: PoolConnection): Promise<any> {  
    const ret = await buddyModel.findAllBuddies(profileId, options)
    
    return ret   
  }

  async getBuddyProfiles(profileId: number, connection?: PoolConnection): Promise<any> {
    return await buddyModel.findBuddyProfiles(profileId, connection)
  }

  async getBuddySearch(profileId: number, options:{email:string, page: number, perPage: number},connection?: PoolConnection): Promise<any> {  
    const {userId} = await profileModel.findOneProfileById(profileId)
    if(!userId) {throw new Error ('다시 로그인 해주세요.')}
    const ret = await buddyModel.findAllBuddiesSearch(userId, profileId, options)
    
    return ret   
  }

  /**
   * 부모가 친구 탭에서 피드를 조회합니다.
   * @param profileId 
   * @param options 
   * @param connection 
   * @returns 
   */
  async getBuddiesNews(profileId: number, options:{page: number, perPage: number}, connection?: PoolConnection): Promise<any> {  
    return await buddyModel.findBuddiesNews(profileId, options, connection)
  }

  async getBuddiesInChatRoom(chatRoomId: number, profileId: number, connection?: PoolConnection): Promise<any> {  
    return await buddyModel.findBuddiesInChatRoom(chatRoomId, profileId, connection)
  }

  async putBuddy(profileId: number, buddyProfileId:number, buddyName:string,connection?: PoolConnection): Promise<any> {  
    const ret = await buddyModel.updateBuddy({followerId:profileId, followingId:buddyProfileId}, buddyName)
    if (!ret) {throw new Error('친구 이름 수정에 실패하였습니다.')}

    return ret   
  }

  async deleteBuddy(profileId: number, buddyProfileId: number,connection?: PoolConnection): Promise<void> {           
    const retMy = await buddyModel.deleteBuddy({followerId:profileId, followingId:buddyProfileId}, connection)
    if (!retMy) {throw new Error('친구 상태가 아니거나 삭제에 실패하였습니다.')}

    const ret = await buddyModel.deleteBuddy({followerId:buddyProfileId, followingId:profileId}, connection)
    if (!ret) {throw new Error('친구 상태가 아니거나 삭제에 실패하였습니다.')}
  }

}

export const buddyService = new BuddyService()
