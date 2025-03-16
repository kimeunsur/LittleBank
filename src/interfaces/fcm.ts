/**
 * FCM의 메시지 타입
 */
export enum FcmType {
  FAMILY = 'family',
  DM = 'dm',
  // FRIEND = 'friend',
  OFFLINE = 'offline', // 피드 조회 시 알림. 현재 사용하지 않음
}

/**
 * 보여지지 않은 부분만 포함하는 객체
 */
export interface FcmData {
  dataId: number // profileId
  type: FcmType
  sound?: string // 알림음 default: 'default'
}

/**
 * FCM의 보여지는 데이터만 포함하는 객체
 */
export class FcmMessage {
  title: string // name
  body: string // message content

  constructor(key: FcmType, name: string, content: string) {
    switch (key) {
      case FcmType.FAMILY:
        this.title = name
        this.body = content
        break
      case FcmType.DM:
        this.title = name
        this.body = content
        break
      case FcmType.OFFLINE:
        this.title = name
        this.body = content
        break
      default:
        throw new Error('Invalid FcmType')
    }
  }
}