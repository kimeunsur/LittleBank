import {allowanceModel} from '../models/allowance'
import {profileModel} from '../models/profile'
import {chatService} from '../services/chatService'
import {socketManager} from '../libs/socketManager'
import {ITaskChat} from '../interfaces/chat'
import {PoolConnection} from 'mysql'
import { ChatType } from '../interfaces/chatType'
import { historyModel } from '../models/history'
import { chatModel } from '../models/chat'
import { buddyService } from './buddyService'
import { fcmManager } from '../libs/fcmManager'

class AllowanceService {
  async postAllowanceTask(profileId: number,options: {taskContent: string, taskAmount: number},connection?: PoolConnection): Promise<void> {
    const {userId, isParent} = await profileModel.findOneProfileById(profileId)
    if(!userId || !isParent) {throw new Error ('부모님만 가능합니다.')}
    const ret = await allowanceModel.createAllowanceTask({userId, ...options})
    if (!ret) {throw new Error('용돈 항목 생성에 실패하였습니다.')}

    return ret   
  }

  async getAllowanceTasks(profileId: number, options:{page: number, perPage: number},connection?: PoolConnection): Promise<void> {
    const {userId} = await profileModel.findOneProfileById(profileId)
    if (!userId) {throw new Error('용돈 항목을 찾을 수 없습니다.')}
    const ret = await allowanceModel.findAllAllowanceTasks(userId, options)
    if (ret.total === 0) {throw new Error('등록된 용돈 항목이 존재하지 않습니다.')}
    
    return ret   
  }

  async putAllowanceTask(profileId: number, allowanceTaskId: number,options: {taskContent?: string, taskAmount?: number},connection?: PoolConnection): Promise<void> {   
    const {isParent} = await profileModel.findOneProfileById(profileId)
    if(!isParent) {throw new Error ('부모님만 가능합니다.')}
    options = Object.fromEntries(Object.entries(options).filter(([_, value]) => value != null))
    const ret = await allowanceModel.updateAllowanceTask(allowanceTaskId, options)
    if (!ret) {throw new Error('용돈 항목 수정에 실패하였습니다.')}

    return ret   
  }

  async deleteAllowanceTask(profileId: number, allowanceTaskId: number,connection?: PoolConnection): Promise<void> {       
    const {isParent} = await profileModel.findOneProfileById(profileId)
    if(!isParent) {throw new Error ('부모님만 가능합니다.')}
    const ret = await allowanceModel.deleteAllowanceTask(allowanceTaskId)
    if (!ret) {throw new Error('용돈 항목 삭제에 실패하였습니다.')}
      
    return ret   
  }

  async postAllowanceChat(chatRoomId:number,allowanceTaskId: number,
    options: {
      profileId: number,
      allowanceChat: string,
      allowanceChatImage: string
    },connection?: PoolConnection): Promise<void> {
    const {profileId, allowanceChat, allowanceChatImage} = options

    const {isParent} = await profileModel.findOneProfileById(profileId, connection)
    if(isParent !== 0) {throw new Error ('아이만 가능합니다.')}  

    const {taskContent, taskAmount} = await allowanceModel.findOneAllowanceTask(allowanceTaskId, connection)
    if (!taskContent || !taskAmount) {throw new Error('용돈 항목을 찾을 수 없습니다.')}

    const chatType = ChatType.TASK
    const content: ITaskChat = {
      allowanceChatId:null,
      allowanceChat,
      allowanceContent:taskContent,
      allowanceAmount:taskAmount,
      allowanceChatImage,      
      allowanceChatStatus:'pending',      
      }      

    const chatMessageId = await chatService.createChatMessage(chatRoomId, profileId, chatType, content, connection)    
    if (!chatMessageId) {throw new Error('채팅 발송에 실패하였습니다.')}
    
    const allowanceChatId = await allowanceModel.createAllowanceChat({chatMessageId,allowanceContent:taskContent,allowanceAmount:taskAmount,...options},connection)
    if (!allowanceChatId) {throw new Error('용돈 요청에 실패하였습니다.')}
    content.allowanceChatId = allowanceChatId

    const ret = await socketManager.emitReceiveMessage(profileId, chatRoomId, chatMessageId, chatType, content, connection)    

    return
  }

  async getAllowanceChat(allowanceChatId: number, connection?: PoolConnection): Promise<any> {  
    const ret = await allowanceModel.findOneAllowanceChat(allowanceChatId)
    if (!ret) {throw new Error("용돈 채팅이 존재하지 않습니다.")}
    
    return ret
  }

  async putAllowanceChatComplete(profileId: number, allowanceChatId: number,connection?: PoolConnection): Promise<void> {   
    const {isParent, parentAmount} = await profileModel.findOneProfileById(profileId, connection)
    if(!isParent) {throw new Error ('부모님만 가능합니다.')}

    const allowance = await allowanceModel.findOneAllowanceChat(allowanceChatId, connection)
    if(!allowance) {throw new Error ('존재하지 용돈 요청입니다.')}  

    const {allowanceContent, allowanceChat, allowanceChatImage, allowanceAmount, chatMessageId} = allowance
    const childProfileId = allowance.profileId
    if(parentAmount-allowanceAmount < 0){throw new Error ('금액이 부족합니다')}        
    if(allowance.allowanceChatStatus === 'complete') {throw new Error ('이미 완료된 용돈 요청입니다.')}
       
    const child = await profileModel.findOneProfileById(childProfileId, connection)
    if(!child) {throw new Error ('포인트 전송 대상이 존재하지 않습니다.')}    
    
    const updateParentAmount = await profileModel.updateProfileById(profileId,{parentAmount:parentAmount-allowanceAmount}, connection)
    if(!updateParentAmount) {throw new Error('포인트 전송에 실패하였습니다.')}   

    const updateChildAmount = await profileModel.updateProfileById(childProfileId,{childAmount:child.childAmount+allowanceAmount}, connection)
    if(!updateChildAmount) {throw new Error('포인트 전송에 실패하였습니다.')}    
        
    const allowanceType = 'task'
    const history = await historyModel.createHistory({profileId:childProfileId, allowanceType, targetId:allowanceChatId}, connection)
    if (!history) {throw new Error('포인트 전송 기록에 실패하였습니다.')}

    const allowanceChatStatus = 'complete'    
    const update = await allowanceModel.updateAllowanceChat(allowanceChatId, {allowanceChatStatus},connection)
    if (!update) {throw new Error('포인트 전송에 실패하였습니다.')}
    
    const chat = await chatModel.findOneChatMessage(chatMessageId, connection)
    if (!chat) {throw new Error('존재하지 않는 채팅입니다.')}

    const content: ITaskChat = {
      allowanceChatId,
      allowanceChat,
      allowanceContent,
      allowanceAmount,
      allowanceChatImage,      
      allowanceChatStatus,      
      }

    await socketManager.emitChangeChatStatus(chat.chatRoomId, chat.profileId, chatMessageId, content)   

    const message = chatService.getContent(ChatType.MISSION)
    const buddies = await buddyService.getBuddyProfiles(child.profileId, connection)
    const dto = {
      isFamily: false,
      name: child.name,
      buddies,
      message
    }
    // await fcmManager.sendFcmToFriends(child.profileId, dto)
  }
}

export const allowanceService = new AllowanceService()
