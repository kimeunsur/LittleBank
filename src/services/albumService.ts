import {albumModel} from '../models/album'
import {chatService} from '../services/chatService'
import {profileModel} from '../models/profile'
import {socketManager} from '../libs/socketManager'
import {IAlbumChat} from '../interfaces/chat'
import {PoolConnection} from 'mysql'
import { ChatType } from '../interfaces/chatType'
import { historyModel } from '../models/history'
import { chatModel } from '../models/chat'
import { buddyModel } from '../models/buddy'
import { settingModel } from '../models/setting'

class AlbumService {
  async postAlbumChat(chatRoomId:number,
    options: {
      profileId: number,
      albumChat: string,
      albumAmount: number
    },
    albumImages: [string],
    connection?: PoolConnection): Promise<void> {
    
    const {profileId, albumChat, albumAmount} = options

    const {isParent} = await profileModel.findOneProfileById(profileId, connection)
    if(isParent !== 0) {throw new Error ('아이만 가능합니다.')}

    const adminSetting = await settingModel.findAdminSetting()
    if(!adminSetting) {throw new Error ('수수료 확인에 실패하였습니다. 다시 시도해주세요.')}
    const sellingFeeMin = adminSetting.data[0].sellingFeeMin ?? 0
    if(albumAmount<sellingFeeMin) {throw new Error (`앨범 판매 최소 금액은 ${sellingFeeMin}원 입니다.`)}    

    const chatType = ChatType.ALBUM
    const content: IAlbumChat = {
      allowanceAlbumId:null,
      albumChat,
      albumAmount,      
      albumStatus:'pending',
      albumImages      
      }      

    const chatMessageId = await chatService.createChatMessage(chatRoomId, profileId, chatType, content, connection)    
    if (!chatMessageId) {throw new Error('채팅 발송에 실패하였습니다.')}
    
    const allowanceAlbumId = await albumModel.createAlbumChat({chatMessageId,...options},connection)
    if (!allowanceAlbumId) {throw new Error('앨범 생성에 실패하였습니다.')}
    content.allowanceAlbumId = allowanceAlbumId

    for(const albumImage of albumImages) {
      const ret = await albumModel.createAlbumIamge(allowanceAlbumId,albumImage,connection)
      if (!ret) {throw new Error('사진 업로드에 실패하였습니다.')}      
    }   

    await socketManager.emitReceiveMessage(profileId, chatRoomId, chatMessageId, chatType, content, connection)
    
  }

  async getAlbumChat(allowanceAlbumId: number, connection?: PoolConnection): Promise<any> {  
    const ret = await albumModel.findOneAlbum(allowanceAlbumId)
    if (!ret) {throw new Error("앨범이 존재하지 않습니다.")}
    
    return ret
  }

  async putAlbumChatComplete(profileId: number, allowanceAlbumId: number,connection?: PoolConnection): Promise<void> {
    const {isParent, parentAmount} = await profileModel.findOneProfileById(profileId, connection)
    if(!isParent) {throw new Error ('부모님만 가능합니다.')}    

    const album = await albumModel.findOneAlbum(allowanceAlbumId, connection)
    if(!album) {throw new Error ('존재하지 않는 앨범입니다.')}

    const {albumChat, albumAmount, chatMessageId, albumImages} = album
    const childProfileId = album.profileId
    if(parentAmount-albumAmount < 0){throw new Error ('금액이 부족합니다')}
    if(album.albumStatus === 'complete') {throw new Error ('이미 완료된 앨범 판매입니다.')}
       
    const child = await profileModel.findOneProfileById(childProfileId, connection)
    if(!child) {throw new Error ('포인트 전송 대상이 존재하지 않습니다.')}    
    
    const updateParentAmount = await profileModel.updateProfileById(profileId,{parentAmount:parentAmount-albumAmount}, connection)
    if(!updateParentAmount) {throw new Error('포인트 전송에 실패하였습니다.')}

    const adminSetting = await settingModel.findAdminSetting()
    if(!adminSetting) {throw new Error ('수수료 확인에 실패하였습니다. 다시 시도해주세요.')}
    
    const sellingFee = adminSetting.data[0].sellingFee ?? 0
    const totalAmount = Math.floor(albumAmount * ((100 - sellingFee) / 100))
    const albumFee = albumAmount - totalAmount

    const buddy = await buddyModel.findBuddyName({followerId:childProfileId, followingId:profileId}, connection)
    if(!buddy) {throw new Error ('앨범은 친구에게만 팔 수 있습니다.')}

    const updateChildAmount = await profileModel.updateProfileById(childProfileId,{childAmount:child.childAmount+totalAmount}, connection)
    if(!updateChildAmount) {throw new Error('포인트 전송에 실패하였습니다.')}    
        
    const allowanceType = 'album'
    const history = await historyModel.createHistory({profileId:childProfileId, allowanceType, targetId:allowanceAlbumId}, connection)
    if (!history) {throw new Error('포인트 전송에 실패하였습니다.')}
    
    const albumStatus = 'complete'
    
    const update = await albumModel.updateAlbumChat(allowanceAlbumId, {albumStatus, albumBuyerName: buddy.buddyName ?? null, albumBuyerId:profileId, albumFee},connection)
    if (!update) {throw new Error('포인트 전송에 실패하였습니다.')}
    
    const chat = await chatModel.findOneChatMessage(chatMessageId, connection)
    if (!chat) {throw new Error('존재하지 않는 채팅입니다.')}

    const content: IAlbumChat = {
      allowanceAlbumId,
      albumChat,
      albumAmount,      
      albumStatus,
      albumImages  
      } 

    await socketManager.emitChangeChatStatus(chat.chatRoomId, chat.profileId, chatMessageId, content)

    return
  }
}

export const albumService = new AlbumService()
