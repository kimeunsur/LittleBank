/**
 * chatType: mission
 */
export interface IMissionChat {
  allowanceMissionId:number,
  missionChat: string,
  missionAmount: number,
  missionStartDate: string,
  missionStatus: string,
  missionEndDate: string,
  missionParentComment: string,
  missionParentImage: string,
  missionChildComment?: string,
  missionChildImage?: string,
  childProfileId?: number,
  childProfileName?: string 
}

/**
 * chatType: album
 */
export interface IAlbumChat {
  allowanceAlbumId: number,
  albumChat: string,
  albumAmount: number,      
  albumStatus: string,
  albumImages: [string]
}

/**
 * chatType: task
 */
export interface ITaskChat {
  allowanceChatId: number,
  allowanceChat: string,
  allowanceAmount: number,
  allowanceChatStatus: string,
  allowanceChatImage: string,      
  allowanceContent: string
}

/**
 * chatType: message, photo
 */
export interface IGeneralChat {
  chatContent: string
}

/**
 * sendMessage event
 */
export interface ISendMessageReq {
  chatRoomId: number, // 채팅방 아이디
  chatType: string, // 채팅 메시지 타입
  content: IGeneralChat // 
}

export interface ISendMessageRes {
  chatMessageId: number, // 채팅 메시지 아이디
}

/**
 * receiveMessage event
 */
export interface IReceiveMessage {
  profileId: number, // 보낸 사람의 프로필 아이디
  profileImage: string, // 보낸 사람의 프로필 이미지
  name: string, // 보낸 사람의 이름
  chatMessageId: number, // 채팅 메시지 아이디
  chatType: string, // 채팅 메시지 타입
  content: IGeneralChat | IMissionChat | IAlbumChat | ITaskChat, // 채팅 메시지 내용
  createdAt: string // 채팅 메시지 생성 시간
}

export interface IReceiveUnreadMessageCountRes {
	family: number, // 읽지 않은 가족 메시지 수
	buddy: number // 읽지 않은 친구 메시지 수
}

export interface IReceiveUnreadUserCountRes {
	unreadUserCounts: IUnreadUserCount[] // 읽지 않은 유저 수
  currentUserCounts: number
}

export interface IUnreadUserCount {
  rangeStart: number,
  rangeEnd: number,
  unreadUserCount: number
}

export interface IChatMessage {
  proflieId: number,
  name: string,
  chatMessageId: number,
  chatType: string,
  content: IGeneralChat | IMissionChat | IAlbumChat | ITaskChat,
  createdAt: string
}

export interface IChangeMissionStatusRes {
  chatMessageId: number,
  content: IMissionChat
}

export interface IChangeTaskStatusRes {
  chatMessageId: number,
  content: ITaskChat
}

export interface IChangeAlbumStatusRes {
  chatMessageId: number,
  content: IAlbumChat
}