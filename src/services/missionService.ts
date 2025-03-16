import {missionModel} from '../models/mission'
import {chatService} from '../services/chatService'
import {profileModel} from '../models/profile'
import {socketManager} from '../libs/socketManager'
import {IMissionChat} from '../interfaces/chat'
import {PoolConnection} from 'mysql'
import { ChatType } from '../interfaces/chatType'
import { chatModel } from '../models/chat'
import { historyModel } from '../models/history'
import { fcmManager } from '../libs/fcmManager'
import { buddyService } from './buddyService'
import { profileService } from './profileService'

class MissionService {
  async postMissionChat(
    profileId:number,
    chatRoomId:number,
    options: {      
      missionChat:string,
      missionAmount:number,
      missionStartDate:string,
      missionEndDate:string,
      missionParentComment:string,
      missionParentImage:string
    },connection?: PoolConnection): Promise<void> {
    const {missionChat, missionAmount, missionStartDate, missionEndDate, missionParentComment, missionParentImage} = options
    const {isParent} = await profileModel.findOneProfileById(profileId, connection)
    if(!isParent) {throw new Error ('부모님만 가능합니다.')}    

    const chatType = ChatType.MISSION
    const content: IMissionChat = {
      allowanceMissionId:null,
      missionChat,
      missionAmount,
      missionStartDate,
      missionEndDate,
      missionParentComment,
      missionParentImage,
      missionChildComment:null,
      missionChildImage:null,
      missionStatus:'missionCreate',
      childProfileId:null,
      childProfileName:null
      }      

    const chatMessageId = await chatService.createChatMessage(chatRoomId, profileId, chatType, content, connection)    
    if (!chatMessageId) {throw new Error('채팅 발송에 실패하였습니다.')}
    
    const allowanceMissionId = await missionModel.createMissionChat({chatMessageId,profileId,...options}, connection)
    if (!allowanceMissionId) {throw new Error('미션 생성에 실패하였습니다.')}

    content.allowanceMissionId = allowanceMissionId
    await socketManager.emitReceiveMessage(profileId, chatRoomId, chatMessageId, chatType, content, connection)    

    return
  }

  private isFamily(userId: number, targetUserId: number) {
    return userId === targetUserId
  }

  async getMissionChat(allowanceMissionId: number, profileId: number, connection?: PoolConnection): Promise<any> {  
    const ret = await missionModel.findOneMission(allowanceMissionId, connection)
    if (!ret) {
      throw new Error("미션이 존재하지 않습니다.")
    }
    
    const {childProfileId} = ret
    if (childProfileId) {
      const profile = await profileService.getProfileInfo(profileId, connection)
      const childProfile = await profileService.getProfileInfo(childProfileId, connection)
      const userId = profile.userId
      const childUserId = childProfile.userId
      let name = ''
      if (this.isFamily(userId, childUserId)) {
        name = await profileService.getFamilyName(childProfileId, connection)
      } else {
        name = await buddyService.getBuddyName(profileId, childProfileId, connection)
      }
      ret['childProfileName'] = name
      ret['childProfileImage'] = childProfile.profileImage
    } else {
      ret['childProfileName'] = null
      ret['childProfileImage'] = null
    }
    return ret
  }

  async putMissionChat(
    profileId:number,
    allowanceMissionId:number,    
    options: {      
      missionChat?:string,
      missionAmount?:number,
      missionStartDate?:string,
      missionEndDate?:string,
      missionParentComment?:string,
      missionParentImage?:string
    },connection?: PoolConnection): Promise<void> {
    const {isParent} = await profileModel.findOneProfileById(profileId, connection)
    if(!isParent) {throw new Error ('부모님만 가능합니다.')}

    options = Object.fromEntries(Object.entries(options).filter(([_, value]) => value != null))

    const ret = await missionModel.updateMissionChat(allowanceMissionId, options)
    if (!ret) {throw new Error('미션 수정에 실패하였습니다.')}

    const mission = await missionModel.findOneMission(allowanceMissionId, connection)
    if(!mission || mission.missionStatus !=="missionCreate") {throw new Error ('미션 생성 직후에만 수정 가능합니다.')}
    const {chatMessageId, missionChat, missionAmount, missionStartDate, missionEndDate, missionParentComment, missionParentImage} = mission    
    
    const chat = await chatModel.findOneChatMessage(chatMessageId, connection)
    if (!chat) {throw new Error('존재하지 않는 채팅입니다.')}

    const content: IMissionChat = {
      allowanceMissionId,
      missionChat,
      missionAmount,
      missionStartDate,
      missionEndDate,
      missionParentComment,
      missionParentImage,
      missionChildComment:null,
      missionChildImage:null,
      missionStatus:'missionCreate',
      childProfileId:null,
      childProfileName:null
      }  

    await socketManager.emitChangeChatStatus(chat.chatRoomId, chat.profileId, chatMessageId, content)

    return ret   
  }

  async putMissionChatRequest(profileId: number, allowanceMissionId: number,connection?: PoolConnection): Promise<void> {   
    const {isParent, name} = await profileModel.findOneProfileById(profileId, connection)
    if(isParent !== 0) {throw new Error ('아이만 가능합니다.')}

    const mission = await missionModel.findOneMission(allowanceMissionId, connection)
    if (!mission) {throw new Error('존재하지 않는 미션입니다.')}
    if(mission.missionStatus !=="missionCreate") {throw new Error ('미션 요청이 불가능한 상태입니다.')}

    const {childProfileId, chatMessageId, missionChat, missionAmount, missionStartDate, missionEndDate, missionParentComment, missionParentImage} = mission
    if(childProfileId) {throw new Error ('이미 다른 사람이 신청한 미션입니다.')}
     
    const missionStatus = 'assignRequest'
    const ret = await missionModel.updateMissionChat(allowanceMissionId, {childProfileId:profileId, missionStatus}, connection)
    if (!ret) {throw new Error('미션 요청에 실패하였습니다.')}

    const chat = await chatModel.findOneChatMessage(chatMessageId, connection)
    if (!chat) {throw new Error('존재하지 않는 채팅입니다.')}

    const content: IMissionChat = {
      allowanceMissionId,
      missionChat,
      missionAmount,
      missionStartDate,
      missionEndDate,
      missionParentComment,
      missionParentImage,
      missionChildComment:null,
      missionChildImage:null,
      missionStatus,
      childProfileId:profileId,
      childProfileName:name
      } 

    await socketManager.emitChangeChatStatus(chat.chatRoomId, chat.profileId, chatMessageId, content)

    return
  }

  async putMissionChatAssign(profileId: number, allowanceMissionId: number,connection?: PoolConnection): Promise<void> {   
    const {isParent} = await profileModel.findOneProfileById(profileId, connection)
    if(!isParent) {throw new Error ('부모님만 가능합니다.')}

    const mission = await missionModel.findOneMission(allowanceMissionId, connection)
    if (!mission) {throw new Error('존재하지 않는 미션입니다.')}
    if(mission.missionStatus !=="assignRequest") {throw new Error ('미션 승인이 불가능한 상태입니다.')}

    const {chatMessageId, missionChat, missionAmount, missionStartDate, missionEndDate, missionParentComment, missionParentImage, childProfileId} = mission    
     
    const missionStatus = 'assigned'
    const update = await missionModel.updateMissionChat(allowanceMissionId, {missionStatus}, connection)
    if (!update) {throw new Error('미션 승인에 실패하였습니다.')}

    const chat = await chatModel.findOneChatMessage(chatMessageId, connection)
    if (!chat) {throw new Error('존재하지 않는 채팅입니다.')}

    const {name} = await profileModel.findOneProfileById(childProfileId, connection)
    if(!name) {throw new Error ('존재하지 않는 프로필입니다.')}

    const content: IMissionChat = {
      allowanceMissionId,
      missionChat,
      missionAmount,
      missionStartDate,
      missionEndDate,
      missionParentComment,
      missionParentImage,
      missionChildComment:null,
      missionChildImage:null,
      missionStatus,
      childProfileId,
      childProfileName:name
      } 

    await socketManager.emitChangeChatStatus(chat.chatRoomId, chat.profileId, chatMessageId, content) 

    return   
  }

  async putMissionChatChildComplete(profileId: number, allowanceMissionId: number,
    options: {     
      missionChildComment?:string,
      missionChildImage?:string
    },connection?: PoolConnection): Promise<void> {   
    const {missionChildComment, missionChildImage} = options

    const {isParent} = await profileModel.findOneProfileById(profileId, connection)
    if(isParent !== 0) {throw new Error ('아이만 가능합니다.')}   

    const mission = await missionModel.findOneMission(allowanceMissionId, connection)
    if (!mission) {throw new Error('존재하지 않는 미션입니다.')}

    const {chatMessageId, missionChat, missionAmount, missionStartDate, missionEndDate, missionParentComment, missionParentImage, childProfileId} = mission    
    if(childProfileId !== profileId) {throw new Error ('미션 완료는 본인만 가능합니다.')}
    if(mission.missionStatus !=="assigned") {throw new Error ('승인되지 않은 미션입니다.')}    
     
    const missionStatus = 'missionComplete'
    const update = await missionModel.updateMissionChat(allowanceMissionId, {missionChildComment, missionChildImage, missionStatus}, connection)
    if (!update) {throw new Error('미션 승인에 실패하였습니다.')}

    const chat = await chatModel.findOneChatMessage(chatMessageId, connection)
    if (!chat) {throw new Error('존재하지 않는 채팅입니다.')}

    const {name} = await profileModel.findOneProfileById(childProfileId, connection)
    if(!name) {throw new Error ('존재하지 않는 프로필입니다.')}

    const content: IMissionChat = {
      allowanceMissionId,
      missionChat,
      missionAmount,
      missionStartDate,
      missionEndDate,
      missionParentComment,
      missionParentImage,
      missionChildComment,
      missionChildImage,
      missionStatus,
      childProfileId,
      childProfileName:name
      } 

    await socketManager.emitChangeChatStatus(chat.chatRoomId, chat.profileId, chatMessageId, content) 

    return
  }

  async putMissionChatComplete(profileId: number, allowanceMissionId: number,connection?: PoolConnection): Promise<void> {   
    const {isParent, parentAmount} = await profileModel.findOneProfileById(profileId, connection)
    if(!isParent) {throw new Error ('부모님만 가능합니다.')}

    const mission = await missionModel.findOneMission(allowanceMissionId, connection)
    if (!mission) {throw new Error('존재하지 않는 미션입니다.')}

    const {chatMessageId, missionChat, missionAmount, missionStartDate, missionEndDate, missionParentComment, missionParentImage, childProfileId, missionChildComment, missionChildImage} = mission   
    if(mission.missionStatus !=="missionComplete") {throw new Error ('아이가 미션을 완료하지 않았습니다.')}    

    if(parentAmount-missionAmount < 0){throw new Error ('금액이 부족합니다')}

    const {name, childAmount} = await profileModel.findOneProfileById(childProfileId, connection)
    if(!name) {throw new Error ('존재하지 않는 프로필입니다.')}
    
    const updateParentAmount = await profileModel.updateProfileById(profileId,{parentAmount:parentAmount-missionAmount}, connection)
    if(!updateParentAmount) {throw new Error('포인트 전송에 실패하였습니다.')}   

    const updateChildAmount = await profileModel.updateProfileById(childProfileId,{childAmount:childAmount+missionAmount}, connection)
    if(!updateChildAmount) {throw new Error('포인트 전송에 실패하였습니다.')}

    const allowanceType = 'mission'
    const history = await historyModel.createHistory({profileId:childProfileId, allowanceType, targetId:allowanceMissionId}, connection)
    if (!history) {throw new Error('포인트 전송 기록에 실패하였습니다.')}
     
    const missionStatus = 'complete'
    const update = await missionModel.updateMissionChat(allowanceMissionId, {missionStatus}, connection)
    if (!update) {throw new Error('포인트 전송에 실패하였습니다.')}

    const chat = await chatModel.findOneChatMessage(chatMessageId, connection)
    if (!chat) {throw new Error('존재하지 않는 채팅입니다.')}  

    const content: IMissionChat = {
      allowanceMissionId,
      missionChat,
      missionAmount,
      missionStartDate,
      missionEndDate,
      missionParentComment,
      missionParentImage,
      missionChildComment,
      missionChildImage,
      missionStatus,
      childProfileId,
      childProfileName:name
      } 

    await socketManager.emitChangeChatStatus(chat.chatRoomId, chat.profileId, chatMessageId, content)

    const message = chatService.getContent(ChatType.MISSION)
    const buddies = await buddyService.getBuddyProfiles(childProfileId, connection)
    const dto = {
      isFamily: false,
      name, 
      buddies, 
      message
    }
    // await fcmManager.sendFcmToFriends(childProfileId, dto)
  }

  async deleteMissionChat(profileId: number, allowanceMissionId: number,connection?: PoolConnection): Promise<void> {           
    const {isParent} = await profileModel.findOneProfileById(profileId)
    if(!isParent) {throw new Error ('부모님만 가능합니다.')}

    const check = await missionModel.findOneMission(allowanceMissionId)
    if(!check || check.missionStatus !=="missionCreate") {throw new Error ('미션 생성 직후에만 삭제 가능합니다.')}

    const ret = await missionModel.deleteMissionChat(allowanceMissionId)
    if (!ret) {throw new Error('미션 삭제에 실패하였습니다.')}
      
    return ret   
  }
}

export const missionService = new MissionService()
