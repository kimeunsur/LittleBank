"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalance = exports.getDash = void 0;
const default_1 = require("../../default");
const dashboardCtrl_1 = require("./dashboardCtrl");
const getDash = new default_1.ApiRouter({
    name: ':param',
    method: 'get',
    summary: '대시보드 조회',
    description: `
    v1.0.0
    2024-10-17 13:00
    작성자 : 주지민
    ---------------------------------------

    param -> string ex) 2024-08

  `,
    tags: ['Dash'],
    isPublic: false,
    paths: ['common/stringPath'],
    responses: {
        200: { schema: 'responses/admin/dashboard/getDash' }
    },
    handler: dashboardCtrl_1.dashboardCtrl.getDash
});
exports.getDash = getDash;
const getBalance = new default_1.ApiRouter({
    name: 'balance/amount',
    method: 'get',
    summary: '리틀뱅크 가상계좌 조회',
    description: `
    v1.0.0
    2024-12-02 15:30
    작성자 : 주지민
    ---------------------------------------    

  `,
    tags: ['Dash'],
    isPublic: false,
    responses: {
        200: { schema: 'responses/admin/dashboard/getBalance' }
    },
    handler: dashboardCtrl_1.dashboardCtrl.getBalance
});
exports.getBalance = getBalance;
