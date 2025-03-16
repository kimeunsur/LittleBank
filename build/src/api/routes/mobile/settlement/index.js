"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettlements = exports.postSettlement = void 0;
const default_1 = require("../../default");
const settlementCtrl_1 = require("./settlementCtrl");
const postSettlement = new default_1.ApiRouter({
    name: '',
    method: 'post',
    summary: '정산 신청',
    description: `
    v1.0.0
    2024-09-20 17:00
    작성자 : 주지민
    
    ---------------------------------------

    [required]
    settlementType -> enum("auto","manual") 자동 정산 -> auto, 수동 정산 -> manual
    settlementAmount -> integer 정산요청 금액

  `,
    tags: ['Settlement'],
    isPublic: false,
    schema: 'requests/mobile/settlement/postSettlement',
    responses: {
        200: { description: 'success' }
    },
    handler: settlementCtrl_1.settlementCtrl.postSettlement
});
exports.postSettlement = postSettlement;
const getSettlements = new default_1.ApiRouter({
    name: '',
    method: 'get',
    summary: '정산 신청 내역 조회',
    description: `
    v1.0.0
    2024-09-23 11:00
    작성자 : 주지민
    ---------------------------------------
    [res]
    settlementType : manual -> 수동 입금, auto -> 자동 입금
    settlementStatus : pending -> 입금 대기, complete -> 입금 완료
    
    settlementAmount : 정산 요청 금액
    settlementFee : 정산 수수료
    realSettlementAmount : 실 정산 금액
  `,
    tags: ['Settlement'],
    isPublic: false,
    schema: 'common/page',
    responses: {
        200: { schema: 'responses/mobile/settlement/getSettlements' }
    },
    handler: settlementCtrl_1.settlementCtrl.getSettlements
});
exports.getSettlements = getSettlements;
