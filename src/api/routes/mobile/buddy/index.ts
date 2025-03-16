import { ApiRouter } from "../../default"
import {buddyCtrl} from "./buddyCtrl"

const postBuddy = new ApiRouter({
  name: '',
  method: 'post',
  summary: '친구 추가',
  description: `
    v1.0.0
    2024-07-30 18:00
    작성자 : 주지민
    ---------------------------------------
    required: 
    "buddyProfileId" -> 대상 profileId
    "buddyNameMy" -> 나에게 표시되는 이름
    "buddyNameYou" -> 모두에게 표시되는 이름
  `,
  tags: ['Buddy'],
  isPublic: false,  
  schema: 'requests/mobile/buddy/postBuddy',
  responses: {
    200: { description: 'success'}   
  },
  handler: buddyCtrl.postBuddy
})

const getBuddiesNews = new ApiRouter({
  name: 'news',
  method: 'get',
  summary: '친구 미션/용돈 이체완료 피드 조회',
  description: `
    v1.0.0
    2024-08-19 18:00
    작성자 : 윤재상
    ---------------------------------------   
    chatType -> task/mission에 따라 읽을 데이터가 다릅니다.
    
    1. chatType이 task일 경우
      allowanceChatId: number,
      allowanceContent: string,
      allowanceAmount: number,
      allowanceChatImage: string,      
      allowanceChatStatus: string

    2. chatType이 mission일 경우
      allowanceMissionId:number,
      missionChat: string,
      missionAmount: number,
      missionStartDate: string,
      missionEndDate: string,
      missionParentImage: string,
      missionChildImage?: string,
      missionStatus: string,
      childProfileId?: number,
      
    2024-10-15 11:00
    작성자 : 윤재상
    ---------------------------------------   
    미션 내 comment와 용돈 내 content가 삭제 되었습니다.
  `,
  tags: ['Buddy'],
  isPublic: false,
  schema: 'common/page',
  responses: {
    200: { schema: 'responses/mobile/buddy/getBuddiesNews'}    
  },
  handler: buddyCtrl.getBuddiesNews
})

const getBuddies = new ApiRouter({
  name: '',
  method: 'get',
  summary: '친구 조회',
  description: `
    v1.0.0
    2024-07-30 18:00
    작성자 : 주지민
    ---------------------------------------   
    profileId -> 친구 프로필 아이디
    profileImage -> 친구 프로필 사진
    buddyName -> 친구 표기되는 이름 (부산 이모)
    relation -> 엄마/아빠/아이
    name -> 친구 실제 이름 (홍길순)
    email -> 친구 가족 계정 email    

  `,
  tags: ['Buddy'],
  isPublic: false,
  schema: 'common/page',
  responses: {
    200: { schema: 'responses/mobile/buddy/getBuddies'}    
  },
  handler: buddyCtrl.getBuddies
})

const getBuddySearch = new ApiRouter({
  name: 'search',
  method: 'get',
  summary: '친구 찾기',
  description: `
    v1.0.0
    2024-08-30 17:00
    작성자 : 주지민
    ---------------------------------------   
    친구 검색(찾기)

    email -> email로 검색, 해당 email포함된 profile 모두 노출
    가족은 검색되지 않습니다.

    v1.0.0
    2024-09-23 10:30
    작성자 : 윤재상
    ---------------------------------------   
    이미 친구인 경우, 차단 처리
  `,
  tags: ['Buddy'],
  isPublic: false,
  schema: 'requests/mobile/buddy/getBuddySearch',
  responses: {
    200: { schema: 'responses/mobile/buddy/getBuddySearch'}    
  },
  handler: buddyCtrl.getBuddySearch
})

const putBuddy = new ApiRouter({
  name: ':id',
  method: 'put',
  summary: '친구 표기이름 수정',
  description: `
    v1.0.0
    2024-08-01 11:00
    작성자 : 주지민
    ---------------------------------------
    id -> profileId -> 친구 프로필 아이디    

  `,
  tags: ['Buddy'],
  isPublic: false,
  paths: ['common/idPath'],
  schema: 'requests/mobile/buddy/putBuddy',
  responses: {
    200: { description: 'success'}   
  },
  handler: buddyCtrl.putBuddy
})

const deleteBuddy = new ApiRouter({
  name: ':id',
  method: 'delete',
  summary: '친구 삭제',
  description: `
    v1.0.0
    2024-08-01 11:00
    작성자 : 주지민
    ---------------------------------------
    id -> profileId -> 친구 프로필 아이디    

  `,
  tags: ['Buddy'],
  isPublic: false,
  paths: ['common/idPath'],  
  responses: {
    200: { description: 'success'}   
  },
  handler: buddyCtrl.deleteBuddy
})

export {
  postBuddy,
  getBuddies,
  getBuddySearch,
  getBuddiesNews,
  putBuddy,
  deleteBuddy
}