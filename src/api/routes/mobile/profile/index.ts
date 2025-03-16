import { ApiRouter } from "../../default"
import {profileCtrl} from "./profileCtrl"

const getProfileInfo = new ApiRouter({
  name: 'info',
  method: 'get',
  summary: '프로필유저 인포 조회',
  description: `
    v1.0.1
    2024-11-26 16:30
    작성자 : 윤재상

    fcmToken 업데이트 추가
    ---------------------------------------

    v1.0.0
    2024-07-29 17:00
    작성자 : 주지민

    parentAmount -> 부모님 충전금액(엄마/아빠 개별)
    childAmount -> 아이 정산가능금액
    ---------------------------------------
  
  `,
  tags: ['Profile'],
  isPublic: false,
  schema: 'requests/mobile/profile/getProfileInfo',
  responses: {
    200: { schema: 'responses/mobile/profile/getProfileInfo'}    
  },
  handler: profileCtrl.getProfileInfo
})

const putProfileInfo = new ApiRouter({
  name: 'info',
  method: 'put',
  summary: '프로필유저 인포 수정',
  description: `
    v1.0.0
    2024-07-29 17:00
    작성자 : 주지민
    ---------------------------------------   

  `,
  tags: ['Profile'],
  isPublic: false,
  schema: 'requests/mobile/profile/putProfileInfo',
  responses: {
    200: { description: 'success'}   
  },
  handler: profileCtrl.putProfileInfo
})

const getProfileSetting = new ApiRouter({
  name: 'setting',
  method: 'get',
  summary: '프로필유저 환경 설정 조회',
  description: `
    v1.0.0
    2024-07-29 16:00
    작성자 : 주지민
    ---------------------------------------
    v1.0.0
    2024-10-10 12:00
    작성자 : 윤재상
    ---------------------------------------

    familyAlarm -> 가족방 알림, boolean
    friendAlarm -> 친구 알림, boolean    
    autoFriend -> 자동친구적용 유무, boolean
  `,
  tags: ['Profile'],
  isPublic: false,
  responses: {
    200: { schema: 'responses/mobile/profile/getProfileSetting'}    
  },
  handler: profileCtrl.getProfileSetting
})

const putProfileSetting = new ApiRouter({
  name: 'setting',
  method: 'put',
  summary: '프로필유저 환경 설정 수정',
  description: `
    v1.0.0
    2024-07-29 16:00
    작성자 : 주지민
    ---------------------------------------
    v1.0.0
    2024-10-10 12:00
    작성자 : 윤재상
    ---------------------------------------

    familyAlarm -> 가족방 알림, boolean
    friendAlarm -> 친구 알림, boolean
    autoFriend -> 자동친구적용 유무, boolean
  `,  
  tags: ['Profile'],
  isPublic: false,
  schema: 'requests/mobile/profile/putProfileSetting',
  responses: {
    200: { description: 'success'}    
  },
  handler: profileCtrl.putProfileSetting
})

const deleteProfile = new ApiRouter({
  name: '',
  method: 'delete',
  summary: '프로필유저 탈퇴(삭제)',
  description: `
    v1.0.0
    2024-08-20 15:00
    작성자 : 주지민
    ---------------------------------------

  `,
  tags: ['Profile'],
  isPublic: false,  
  responses: {
    200: { description: 'success'}   
  },
  handler: profileCtrl.deleteProfile
})

export {
  getProfileInfo,
  putProfileInfo,
  getProfileSetting,
  putProfileSetting,
  deleteProfile
}