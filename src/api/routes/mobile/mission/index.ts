import { ApiRouter } from "../../default"
import {missionCtrl} from "./missionCtrl"

const postMissionChat = new ApiRouter({
  name: '',
  method: 'post',
  summary: '미션 생성(부모)',
  description: `
    v1.0.0
    2024-08-01 11:00
    작성자 : 주지민
    ---------------------------------------
    required: 
    "chatRoomId" -> integer 채팅방id
    "missionChat" -> string 미션 내용
    "missionAmount" -> integer 미션 금액
    "missionStartDate" -> 2024-01-23 미션 시작일
    "missionEndDate" -> 2024-02-03 미션 종료일
    "missionParentComment" -> string 부모 메세지
    "missionParentImage" -> string 부모 이미지
  `,
  tags: ['Mission'],
  isPublic: false,  
  schema: 'requests/mobile/mission/postMissionChat',
  responses: {
    200: { description: 'success'}   
  },
  handler: missionCtrl.postMissionChat
})

const getMissionChat = new ApiRouter({
  name: ':id',
  method: 'get',
  summary: '미션 조회',
  description: `
    v1.0.0
    2024-08-01 14:00
    작성자 : 주지민
    ---------------------------------------
    id -> allowanceMissionId    

    v1.0.0
    2024-11-29 15:00
    작성자 : 윤재상
    ---------------------------------------    
    missionStatus -> enum('missionCreate','assignRequest','assigned','missionComplete','complete')
  `,
  tags: ['Mission'],
  isPublic: false,
  paths: ['common/idPath'],  
  responses: {
    200: { schema: 'responses/mobile/mission/getMissionChat'}   
  },
  handler: missionCtrl.getMissionChat
})

const putMissionChat = new ApiRouter({
  name: ':id',
  method: 'put',
  summary: '미션 수정(부모)',
  description: `
    v1.0.0
    2024-08-01 12:00
    작성자 : 주지민
    ---------------------------------------
    id -> allowanceMissionId 
    
    미션 생성 직후에만 가능

  `,
  tags: ['Mission'],
  isPublic: false,
  paths: ['common/idPath'],
  schema: 'requests/mobile/mission/putMissionChat',
  responses: {
    200: { description: 'success'}   
  },
  handler: missionCtrl.putMissionChat
})

const putMissionChatRequest = new ApiRouter({
  name: 'reqeust/:id',
  method: 'put',
  summary: '미션 배정 요청(아이)',
  description: `
    v1.0.0
    2024-08-01 16:30
    작성자 : 주지민
    ---------------------------------------
    id -> allowanceMissionId

  `,
  tags: ['Mission'],
  isPublic: false,
  paths: ['common/idPath'],  
  responses: {
    200: { description: 'success'}   
  },
  handler: missionCtrl.putMissionChatRequest
})

const putMissionChatAssign = new ApiRouter({
  name: 'assign/:id',
  method: 'put',
  summary: '미션 배정 승인(부모)',
  description: `
    v1.0.0
    2024-08-01 16:30
    작성자 : 주지민
    ---------------------------------------
    id -> allowanceMissionId

  `,
  tags: ['Mission'],
  isPublic: false,
  paths: ['common/idPath'],  
  responses: {
    200: { description: 'success'}   
  },
  handler: missionCtrl.putMissionChatAssign
})

const putMissionChatChildComplete = new ApiRouter({
  name: 'childcomplete/:id',
  method: 'put',
  summary: '미션 완료(아이)',
  description: `
    v1.0.0
    2024-08-01 17:00
    작성자 : 주지민
    ---------------------------------------
    id -> allowanceMissionId

     required:    
    "missionChildComment" -> string 아이 메세지
    "missionChildImage" -> string 아이 이미지

  `,
  tags: ['Mission'],
  isPublic: false,
  paths: ['common/idPath'],
  schema: 'requests/mobile/mission/putMissionChatChildComplete',
  responses: {
    200: { description: 'success'}
  },
  handler: missionCtrl.putMissionChatChildComplete
})

const putMissionChatComplete = new ApiRouter({
  name: 'complete/:id',
  method: 'put',
  summary: '미션 이체(부모)',
  description: `
    v1.0.0
    2024-08-01 14:30
    작성자 : 주지민
    ---------------------------------------
    id -> allowanceMissionId

  `,
  tags: ['Mission'],
  isPublic: false,
  paths: ['common/idPath'],  
  responses: {
    200: { description: 'success'}   
  },
  handler: missionCtrl.putMissionChatComplete
})

const deleteMissionChat = new ApiRouter({
  name: ':id',
  method: 'delete',
  summary: '미션 삭제',
  description: `
    v1.0.0
    2024-08-01 12:00
    작성자 : 주지민
    ---------------------------------------
    id -> allowanceMissionId 
    
    미션 생성 직후에만 가능

  `,
  tags: ['Mission'],
  isPublic: false,
  paths: ['common/idPath'],  
  responses: {
    200: { description: 'success'}   
  },
  handler: missionCtrl.deleteMissionChat
})

export {  
  postMissionChat,
  getMissionChat,
  putMissionChat,
  putMissionChatRequest,
  putMissionChatAssign,
  putMissionChatChildComplete,
  putMissionChatComplete,
  deleteMissionChat
}