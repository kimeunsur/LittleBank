import {PoolConnection} from 'mysql'
import {chatModel} from '../models/chat'
import {profileService} from './profileService'
import {socketManager} from '../libs/socketManager'
import {IAlbumChat, IChatMessage, IGeneralChat, IMissionChat, ITaskChat} from '../interfaces/chat'
import {ChatRoomType} from '../interfaces/chatRoomType'
import { ChatType } from '../interfaces/chatType'

class ChatService {
  private NOT_FOUND = '채팅방을 찾을 수 없습니다.'
  private NOT_JOIN = '채팅방에 참여한 사용자가 아닙니다.'

  /**
   * 채팅방 생성과 동시에 채팅방에 입장합니다.
   * @param profileId
   * @param targetProfileId
   * @param connection
   * @returns
   */
  async createChatRoom(
    optoins: {
      userId: number
      profileId: number
      targetProfileId: number | null
      chatRoomType: ChatRoomType
    },
    connection?: PoolConnection
  ): Promise<number> {
    const {userId, profileId, targetProfileId, chatRoomType} = optoins
    const chatRoomId = await chatModel.createChatRoom({userId, chatRoomType}, connection)
    await this.createChatUser(chatRoomId, profileId, connection)
    if (targetProfileId) {
      await this.createChatUser(chatRoomId, targetProfileId, connection)
      await chatModel.increaseChatUserCountChatRoom(chatRoomId, connection)
    }
    return chatRoomId
  }

  /**
   * content chatType이 message 또는 photo라면 참을 반환합니다.
   * content 객체 내에 chatContent가 존재할 때는 chatType이 message 또는 photo입니다.
   * @param content
   * @returns
   */
  private isMessageOrPhoto(content: IGeneralChat | IMissionChat | IAlbumChat | ITaskChat): content is IGeneralChat {
    return 'chatContent' in content
  }

  /**
   * chat_message를 생성합니다.
   * @param chatRoomId
   * @param profileId
   * @param chatType
   * @param content
   * @param connection
   * @returns
   */
  async createChatMessage(
    chatRoomId: number,
    profileId: number,
    chatType: string,
    content: IGeneralChat | IMissionChat | IAlbumChat | ITaskChat,
    connection?: PoolConnection
  ): Promise<number> {
    const chatUser = await chatModel.findChatUser(chatRoomId, profileId, connection)
    if (!chatUser) {
      throw new Error(this.NOT_JOIN)
    }

    let chatContent: string

    if (this.isMessageOrPhoto(content)) {
      chatContent = content.chatContent
    } else {
      chatContent = null
    }
    return await chatModel.createChatMessage({chatRoomId, profileId, chatType, chatContent}, connection)
  }

  /**
   * 가족 목록과 가족 채팅방 메시지 목록을 조회하며 소켓 연결을 진행합니다.
   * @param profileId
   * @param connection
   * @returns
   */
  async getFamilies(profileId: number, options: {page: number; perPage: number}, connection?: PoolConnection) {
    const profile = await profileService.getProfileInfo(profileId, connection)
    const userId = profile.userId
    const profiles = await profileService.getFamilyProfilesInfo(userId, profileId, connection)
    const chatRoom = await this.getFamilyChatRoom(userId, connection)
    if (!chatRoom) {
      throw new Error(this.NOT_FOUND)
    }
    const chatRoomId: number = chatRoom.chatRoomId
    const messages = await this.findRecentChatMessagesByChatRoomIdOrderByAsc(
      chatRoomId,
      profileId,
      userId,
      options,
      connection
    )
    await socketManager.enterChatRoom(chatRoomId, profileId, connection)
    await socketManager.emitReceiveUnreadMessageCounts(profileId, connection)
    return {chatRoomId, profileId, profiles, messages}
  }

  private async createDirectChatRoom(
    options: {
      profileId: number
      targetProfileId: number
      myUserId: number
      targetUserId: number
    },
    connection?: PoolConnection
  ) {
    const {profileId, targetProfileId, myUserId, targetUserId} = options
    let userId = null
    if (myUserId === targetUserId) {
      userId = myUserId
    }
    return await this.createChatRoom(
      {userId, profileId, targetProfileId, chatRoomType: ChatRoomType.DIRECT},
      connection
    )
  }

  /**
   * 채팅방 조회 및 해당 방과 소켓 연결을 진행합니다.
   * getName은 친구 또는 가족 관계 확인을 여기에서 진행하므로 DB 추가 및 수정 작업이 들어가기 전에 실행되어야 합니다.
   * @param chatRoomId
   * @param profileId
   * @returns
   */
  async getDirectChatRoom(
    profileId: number,
    targetProfileId: number,
    options: {page: number; perPage: number},
    connection?: PoolConnection
  ) {
    if (profileId === targetProfileId) {
      throw new Error('올바르지 않은 대상입니다.')
    }

    const name = await profileService.getName(profileId, targetProfileId, connection)

    const profile = await profileService.getProfileInfo(profileId, connection)
    const targetProfile = await profileService.getProfileInfo(targetProfileId, connection)

    let chatRoomId: number
    const chatRoom = await chatModel.findDirectChatRoomByProfileIds(profileId, targetProfileId, connection)
    if (!chatRoom) {
      chatRoomId = await this.createDirectChatRoom(
        {profileId, targetProfileId, myUserId: profile.userId, targetUserId: targetProfile.userId},
        connection
      )
    } else {
      chatRoomId = chatRoom.chatRoomId
    }


    const userId = chatRoom?.userId
    let isFamily = true
    if (!this.isFamily(userId)) {
      options['followerId'] = profileId
      isFamily = false
    }
    const messages = await this.findRecentChatMessagesByChatRoomIdOrderByAsc(
      chatRoomId,
      profileId,
      userId,
      options,
      connection
    )
    await socketManager.enterChatRoom(chatRoomId, profileId, connection)
    return {profileId, name, chatRoomId, isFamily, messages}
  }

  async getChatRoom(chatRoomId: number, connection: PoolConnection) {
    const chatRoom = await chatModel.findChatRoomById(chatRoomId, connection)
    if (!chatRoom) {
      throw new Error(this.NOT_FOUND)
    }
    return chatRoom
  }

  /**
   * profile 생성 시 가족 채팅방에 참여합니다.
   * @param userId
   * @param profileId
   * @param connection
   */
  async enterFamilyChatRoom(userId: number, profileId: number, connection?: PoolConnection): Promise<void> {
    let chatRoom = await chatService.getFamilyChatRoom(userId, connection)
    if (!chatRoom) {
      const targetProfileId = null
      await chatService.createChatRoom(
        {userId, profileId, targetProfileId, chatRoomType: ChatRoomType.GROUP},
        connection
      )
      return
    }
    await this.createChatUser(chatRoom.chatRoomId, profileId, connection)
    await chatModel.increaseChatUserCountChatRoom(chatRoom.chatRoomId, connection)
  }

  async getChatUserProfileIdFcmTokens(chatRoomId: number, connection?: PoolConnection) {
    const chatUsers = await chatModel.findProfilesInChatRoom(chatRoomId, connection)
    if (chatUsers.length === 0) {
      throw new Error('채팅방에 참여한 사용자가 없습니다.')
    }
    return chatUsers
  }

  async getChatMessages(
    profileId: number,
    chatRoomId: number,
    options: {page: number; perPage: number},
    connection?: PoolConnection
  ) {
    const chatRoom = await chatModel.findChatRoomById(chatRoomId, connection)
    if (!chatRoom) {
      throw new Error(this.NOT_FOUND)
    }
    const chatUser = await chatModel.findChatUser(chatRoomId, profileId, connection)
    if (!chatUser) {
      throw new Error(this.NOT_JOIN)
    }

    let userId: number = chatRoom.userId
    if (!this.isFamily(userId)) {
      options['followerId'] = profileId
    }
    const messages = await this.findRecentChatMessagesByChatRoomIdOrderByAsc(
      chatRoomId,
      profileId,
      userId,
      options,
      connection
    )
    return {profileId, messages}
  }

  /**
   * 가족 채팅방에는 userId가 존재하므로 userId를 받아 가족 채팅방인지 확인합니다.
   * @param userId 
   * @returns 
   */
  isFamily(userId: number | null): boolean {
    return userId !== null
  }

  async enterChatRoom(chatRoomId: number, profileId: number, connection?: PoolConnection) {
    const chatUser = await chatModel.findChatUser(chatRoomId, profileId, connection)
    if (!chatUser) {
      throw new Error(this.NOT_JOIN)
    }
    await chatModel.updateChatUserEnterAt(chatRoomId, profileId, connection)
  }

  async leaveChatRoom(chatRoomId: number, profileId: number, connection?: PoolConnection) {
    const chatUser = await chatModel.findChatUser(chatRoomId, profileId, connection)
    if (!chatUser) {
      throw new Error(this.NOT_JOIN)
    }
    await chatModel.updateChatUserLeaveAt(chatRoomId, profileId, connection)
  }

  private async findRecentChatMessagesByChatRoomIdOrderByAsc(
    chatRoomId: number,
    profileId: number,
    userId: number | null,
    options: {page: number; perPage: number; followerId?: number},
    connection?: PoolConnection
  ): Promise<{data: IChatMessage[]; total: number}> {
    let messages: any
    const {page, perPage} = options
    const start = perPage * page - perPage
    const end = perPage
    if (end - start > 1000) {
      throw new Error('100개 보다 많은 메시지를 조회할 수 없습니다.')
    }
    if (this.isFamily(userId)) {
      messages = await chatModel.findRecentChatMessagesByChatRoomIdOrderByAscForFamily(
        chatRoomId,
        profileId,
        options,
        connection
      )
    } else {
      messages = await chatModel.findRecentChatMessagesByChatRoomIdOrderByAscForGeneral(chatRoomId, options, connection)
    }
    const data = this.getMessageByChatType(messages)
    const total = data.length
    return {data, total}
  }

  getFCMContent(chatType: string, content: IGeneralChat | IMissionChat | IAlbumChat | ITaskChat): string {
    switch (chatType) {
      case ChatType.MESSAGE:
        return (content as IGeneralChat).chatContent
      case ChatType.PHOTO:
        return '사진을 보냈습니다.'
      case ChatType.MISSION:
        return '미션을 보냈습니다.'
      case ChatType.ALBUM:
        return '앨범을 보냈습니다.'
      case ChatType.TASK:
        return '용돈 요청을 보냈습니다.'
      default:
        throw new Error('알 수 없는 채팅 형식입니다.')
    }
  }

  getContent(chatType: string): string {
    switch (chatType) {
      case ChatType.MISSION:
        return '친구가 미션을 완료했습니다.'
      case ChatType.TASK:
        return '친구가 용돈을 받았습니다.'
      default:
        throw new Error('알 수 없는 채팅 형식입니다.')
    }
  }

  private getMessageByChatType(messages: any): IChatMessage[] {
    return messages.map((message: any) => {
      let content: IGeneralChat | IMissionChat | IAlbumChat | ITaskChat
      switch (message.chatType) {
        case ChatType.MESSAGE:
        case ChatType.PHOTO:
          content = {chatContent: message.chatContent}
          break
        case ChatType.MISSION:
          content = {
            allowanceMissionId: message.allowanceMissionId,
            missionChat: message.missionChat,
            missionAmount: message.missionAmount,
            missionStartDate: message.missionStartDate,
            missionStatus: message.missionStatus,
            missionEndDate: message.missionEndDate,
            missionParentComment: message.missionParentComment,
            missionParentImage: message.missionParentImage,
            missionChildComment: message.missionChildComment,
            missionChildImage: message.missionChildImage,
            childProfileId: message.childProfileId,
            childProfileName: message.childProfileName
          }
          break
        case ChatType.ALBUM:
          content = {
            allowanceAlbumId: message.allowanceAlbumId,
            albumChat: message.albumChat,
            albumAmount: message.albumAmount,
            albumStatus: message.albumStatus,
            albumImages: message.albumImages.split(',')
          }
          break
        case ChatType.TASK:
          content = {
            allowanceChatId: message.allowanceChatId,
            allowanceChat: message.allowanceChat,
            allowanceAmount: message.allowanceAmount,
            allowanceChatStatus: message.allowanceChatStatus,
            allowanceChatImage: message.allowanceChatImage,
            allowanceContent: message.allowanceContent
          }
          break
        default:
          throw new Error('알 수 없는 채팅 형식입니다.')
      }
      return {
        profileId: message.profileId,
        profileImage: message.profileImage,
        name: message.name,
        chatMessageId: message.chatMessageId,
        chatType: message.chatType,
        content,
        createdAt: message.createdAt
      }
    })
  }

  async getUnreadUserCounts(chatRoomId: number, profileId: number, connection?: PoolConnection) {
    const chatUser = await chatModel.findChatUser(chatRoomId, profileId, connection)
    if (!chatUser) {
      throw new Error(this.NOT_JOIN)
    }
    return await chatModel.findUnreadUserCounts(chatRoomId, connection)
  }

  async getFamilyUnreadMessageCounts(profileId: number, connection?: PoolConnection) {
    return await chatModel.findFamilyUnreadMessageCounts(profileId, connection)
  }

  async getBuddyUnreadMessageCounts(profileId: number, connection?: PoolConnection) {
    return await chatModel.findBuddyUnreadMessageCounts(profileId, connection)
  }

  async getChatUsers(chatRoomId: number, connection?: PoolConnection) {
    return await chatModel.findProfilesInChatRoom(chatRoomId, connection)
  }

  async getChatRoomsByProfileId(profileId: number, connection?: PoolConnection) {
    return await chatModel.findChatRoomsByProfileId(profileId, connection)
  }

  async decreaseChatUserCount(chatRoomId: number, connection?: PoolConnection) {
    return await chatModel.decreaseChatUserCountChatRoom(chatRoomId, connection)
  }

  async deleteChatUserByProfileId(profileId: number, connection?: PoolConnection) {
    return await chatModel.deleteChatUserByProfileId(profileId, connection)
  }

  /**
   * chat_user를 생성합니다.
   * @param chatRoomId
   * @param profileId
   * @param connection
   * @returns
   */
  private async createChatUser(chatRoomId: number, profileId: number, connection?: PoolConnection) {
    return await chatModel.createChatUser({chatRoomId, profileId}, connection)
  }

  /**
   * userId로 가족 채팅방을 조회합니다.
   * @param userId
   * @param connection
   * @returns
   */
  private async getFamilyChatRoom(userId: number, connection?: PoolConnection) {
    return await chatModel.findFamilyChatRoomByUserId(userId, connection)
  }
}

export const chatService = new ChatService()
