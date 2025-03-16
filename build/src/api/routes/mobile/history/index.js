"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllowanceHistoriesParentList = exports.getAllowanceHistoriesParent = exports.getAllowanceHistoriesChild = void 0;
const default_1 = require("../../default");
const historyCtrl_1 = require("./historyCtrl");
const getAllowanceHistoriesChild = new default_1.ApiRouter({
    name: 'child',
    method: 'get',
    summary: '적립금 상세 조회 - 아이용(적립금 내역)',
    description: `
    v1.0.0
    2024-07-30 13:00
    작성자 : 주지민
    ---------------------------------------    
    req
    date -> 2024-04-12 (년도/달만 적용, 날짜 상관 X)

    res
    balance -> 잔액

  `,
    tags: ['History'],
    isPublic: false,
    schema: 'common/pageWithDate',
    responses: {
        200: { schema: 'responses/mobile/history/getAllowanceHistories' }
    },
    handler: historyCtrl_1.historyCtrl.getAllowanceHistoriesChild
});
exports.getAllowanceHistoriesChild = getAllowanceHistoriesChild;
const getAllowanceHistoriesParent = new default_1.ApiRouter({
    name: 'parent/:id',
    method: 'get',
    summary: '적립금 상세 조회 - 부모용(적립금 내역)',
    description: `
    v1.0.0
    2024-07-30 13:00
    작성자 : 주지민
    ---------------------------------------    
    id -> profileId

    req
    date -> 2024-04-12 (년도/달만 적용, 날짜 상관 X)

    res
    balance -> 잔액

  `,
    tags: ['History'],
    isPublic: false,
    paths: ['common/idPath'],
    schema: 'common/pageWithDate',
    responses: {
        200: { schema: 'responses/mobile/history/getAllowanceHistories' }
    },
    handler: historyCtrl_1.historyCtrl.getAllowanceHistoriesParent
});
exports.getAllowanceHistoriesParent = getAllowanceHistoriesParent;
const getAllowanceHistoriesParentList = new default_1.ApiRouter({
    name: 'parent',
    method: 'get',
    summary: '적립금 조회 - 부모용(아이/친구 리스트)',
    description: `
    v1.0.1
    2024-07-30 13:00
    작성자 : 주지민

    화면 변경 대응(리스트에도 날짜 추가)
    ---------------------------------------    

    v1.0.0
    2024-10-17 11:00
    작성자 : 주지민
    ---------------------------------------    

  `,
    tags: ['History'],
    isPublic: false,
    // schema: 'common/page',
    schema: 'common/pageWithDate',
    responses: {
        200: { schema: 'responses/mobile/history/getAllowanceHistoriesParentList' }
    },
    handler: historyCtrl_1.historyCtrl.getAllowanceHistoriesParentList
});
exports.getAllowanceHistoriesParentList = getAllowanceHistoriesParentList;
