"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReport = exports.getReports = exports.postReport = void 0;
const default_1 = require("../../default");
const reportCtrl_1 = require("./reportCtrl");
const postReport = new default_1.ApiRouter({
    name: '',
    method: 'post',
    summary: '신고',
    description: `
    v1.0.0
    2024-08-20 18:00
    작성자 : 윤재상
    ---------------------------------------
  `,
    tags: ['Report'],
    isPublic: false,
    schema: 'requests/mobile/report/postReport',
    responses: {
        200: { description: 'success' }
    },
    handler: reportCtrl_1.reportCtrl.postReport
});
exports.postReport = postReport;
const getReports = new default_1.ApiRouter({
    name: '',
    method: 'get',
    summary: '신고 목록 조회',
    description: `
    v1.0.0
    2024-08-21 09:00
    작성자 : 윤재상
    ---------------------------------------   
  `,
    tags: ['Report'],
    isPublic: false,
    schema: 'common/page',
    responses: {
        200: { schema: 'responses/mobile/report/getReports' }
    },
    handler: reportCtrl_1.reportCtrl.getReports
});
exports.getReports = getReports;
const deleteReport = new default_1.ApiRouter({
    name: ':id',
    method: 'delete',
    summary: '신고 삭제',
    description: `
    v1.0.0
    2028-14-01 11:00
    작성자 : 윤재상
    ---------------------------------------
    id -> reportProfileId -> 신고할 친구 프로필 아이디    

  `,
    tags: ['Report'],
    isPublic: false,
    paths: ['common/idPath'],
    responses: {
        200: { description: 'success' }
    },
    handler: reportCtrl_1.reportCtrl.deleteReport
});
exports.deleteReport = deleteReport;
