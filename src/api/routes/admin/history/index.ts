import { ApiRouter } from "../../default"
import {historyCtrl} from "./historyCtrl"

const getPaymentHistories = new ApiRouter({
  name: 'payment',
  method: 'get',
  summary: '충전 내역(결제 내역)',
  description: `
    v1.0.1
    2024-09-23 12:00
    작성자 : 주지민

    수수료 적용
    --------------------------------------- 

    v1.0.0
    2024-08-14 16:00
    작성자 : 주지민
    --------------------------------------- 

    search -> 이메일, 휴대폰
    order -> 충전일 정렬   
    startTime/endTime -> 날짜 필터
  `,
  tags: ['History'],
  isPublic: false,
  schema: 'requests/admin/history/getPaymentHistories',
  responses: {
    200: { schema: 'responses/admin/history/getPaymentHistories'}    
  },
  handler: historyCtrl.getPaymentHistories
})

const getSettlementHistories = new ApiRouter({
  name: 'settlement',
  method: 'get',
  summary: '정산(출금) 내역 조회',
  description: `
    v1.0.1
    2024-10-18 15:00
    작성자 : 주지민

    필터 추가
    ---------------------------------------

    v1.0.0
    2024-09-20 18:00
    작성자 : 주지민
    ---------------------------------------

  `,
  tags: ['History'],
  isPublic: false,
  schema: 'requests/admin/history/getSettlementHistories',
  responses: {
    200: { schema: 'responses/admin/history/getSettlementHistories'}    
  },
  handler: historyCtrl.getSettlementHistories
})

const putSettlementComplete = new ApiRouter({
  name: 'settlement/:id',
  method: 'put',
  summary: '정산 입금 완료 처리',
  description: `
    v1.0.0
    2024-09-23 12:00
    작성자 : 주지민
    ---------------------------------------
    id -> allowanceSettlementId
  `,
  tags: ['History'],
  isPublic: false,
  paths: ['common/idPath'],  
  responses: {
    200: { description: 'success'}   
  },
  handler: historyCtrl.putSettlementComplete
})

const getAllowanceHistoriesAdmin = new ApiRouter({
  name: 'allowance',
  method: 'get',
  summary: '미션/용돈 내역',
  description: `
    v1.0.0
    2024-09-20 15:00
    작성자 : 주지민
    ---------------------------------------
   
    order -> 기록일 정렬
    startTime/endTime -> 날짜 필터

  `,
  tags: ['History'],
  isPublic: false,
  schema: 'requests/admin/history/getAllowanceHistoriesAdmin',
  responses: {
    200: { schema: 'responses/admin/history/getAllowanceHistoriesAdmin'}
  },
  handler: historyCtrl.getAllowanceHistoriesAdmin
})

const getAllowanceAlbumHistoriesAdmin = new ApiRouter({
  name: 'album',
  method: 'get',
  summary: '앨범 판매 내역',
  description: `
    v1.0.0
    2024-09-23 16:00
    작성자 : 주지민
    ---------------------------------------

    용돈/미션과 분리
   
    order -> 기록일 정렬
    startTime/endTime -> 날짜 필터

  `,
  tags: ['History'],
  isPublic: false,
  schema: 'requests/admin/history/getAllowanceHistoriesAdmin',
  responses: {
    200: { schema: 'responses/admin/history/getAllowanceAlbumHistoriesAdmin'}
  },
  handler: historyCtrl.getAllowanceAlbumHistoriesAdmin
})

const getSettlementUsersDownload = new ApiRouter({
  name: 'settlement/download',
  method: 'get',
  summary: '송금 대상 리스트 엑셀 다운',
  description: `
    v1.0.0
    2024-10-18 13:00
    작성자 : 주지민
    ---------------------------------------        
  `,
  tags: ['History'], 
  responses: {
    200: { description: 'success'}
  },
  handler: historyCtrl.getSettlementUsersDownload
})

export {  
  getPaymentHistories,
  getSettlementHistories,
  putSettlementComplete,
  getAllowanceHistoriesAdmin,
  getAllowanceAlbumHistoriesAdmin,
  getSettlementUsersDownload
}