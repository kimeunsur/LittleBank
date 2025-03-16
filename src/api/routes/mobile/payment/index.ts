import { ApiRouter } from "../../default"
import {paymentCtrl} from "./paymentCtrl"

const postPaymentValid = new ApiRouter({
  name: 'valid',
  method: 'post',
  summary: '결제 정보 DB 저장',
  description: `  
    v1.0.0
    2024-08-27 16:00
    작성자 : 주지민
    ---------------------------------------
    [required]
    product 상품명 : string , ex) "9800포인트 충전"
    amount 상품금액 : integer
    orderId 주문번호 : string

    [res]
    paymentId : integer, DB PK
  `,
  tags: ['Payment'],
  isPublic: false,  
  schema: 'requests/mobile/payment/postPaymentValid',
  responses: {
    // 200: { description: 'success'}
    200: { schema: 'responses/mobile/payment/postPaymentValid'}   
  },
  handler: paymentCtrl.postPaymentValid
})

const postPaymentConfirm = new ApiRouter({
  name: 'confirm/:id',
  method: 'post',
  summary: '포인트 충전 및 결제 승인',
  description: `
    v1.0.1
    2024-09-20 14:00
    작성자 : 주지민

    실결제 적용
    ---------------------------------------

    v1.0.0
    2024-08-27 16:00
    작성자 : 주지민

    ---------------------------------------

    토스페이먼츠 계좌이체로 변경

    id -> paymentId

    [required]
    paymentKey : string
    orderId 주문번호 : string
    amount 상품금액 : integer    

  `,
  tags: ['Payment'],
  isPublic: false,
  paths: ['common/idPath'],
  schema: 'requests/mobile/payment/postPaymentConfirm',
  responses: {
    200: { description: 'success'}   
  },
  handler: paymentCtrl.postPaymentConfirm
})

const getPayments = new ApiRouter({
  name: '',
  method: 'get',
  summary: '결제 내역 조회',
  description: `
    v1.0.1
    2024-09-23 12:00
    작성자 : 주지민

    수수료 추가
    ---------------------------------------

    v1.0.0
    2024-08-28 10:00
    작성자 : 주지민
    ---------------------------------------
    [res]
    product 상품명 : string
    amount 결제 금액 : integer
    paymentFee 결제 수수료 : integer
    orderId 주문번호 : string
    paymentStatus 결제상태 : paid -> 완료, cancel -> 취소
    updatedAt 결제승인시간 : date time

  `,
  tags: ['Payment'],
  isPublic: false,
  schema: 'common/page',
  responses: {
    200: { schema: 'responses/mobile/payment/getPayments'}    
  },
  handler: paymentCtrl.getPayments
})

const postPaymentCancel = new ApiRouter({
  name: 'cancel/:id',
  method: 'post',
  summary: '결제 취소',
  description: `   
    v1.0.0
    2024-08-28 12:00
    작성자 : 주지민

    ---------------------------------------

    id -> paymentId

    [required]
    cancelReason 취소사유 : string

  `,
  tags: ['Payment'],
  isPublic: false,
  paths: ['common/idPath'],
  schema: 'requests/mobile/payment/postPaymentCancel',
  responses: {
    200: { description: 'success'}
  },
  handler: paymentCtrl.postPaymentCancel
})

export {
  postPaymentValid,
  postPaymentConfirm,
  getPayments,
  postPaymentCancel
}