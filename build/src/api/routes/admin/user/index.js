"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.getUsers = void 0;
const default_1 = require("../../default");
const userCtrl_1 = require("./userCtrl");
const getUsers = new default_1.ApiRouter({
    name: '',
    method: 'get',
    summary: '관리자 회원 조회',
    description: `
    v1.0.0
    2024-08-14 11:00
    작성자 : 주지민
    ---------------------------------------    
    search -> 이메일, 휴대폰
    order -> 가입일 정렬

  `,
    tags: ['User'],
    isPublic: false,
    schema: 'requests/admin/user/getUsers',
    responses: {
        200: { schema: 'responses/admin/user/getUsers' }
    },
    handler: userCtrl_1.userCtrl.getUsers
});
exports.getUsers = getUsers;
const getUser = new default_1.ApiRouter({
    name: ':id',
    method: 'get',
    summary: '관리자 회원 상세 조회',
    description: `
    v1.0.0
    2024-08-14 11:00
    작성자 : 주지민
    ---------------------------------------
    id -> userId    

  `,
    tags: ['User'],
    isPublic: false,
    paths: ['common/idPath'],
    responses: {
        200: { schema: 'responses/admin/user/getUser' }
    },
    handler: userCtrl_1.userCtrl.getUser
});
exports.getUser = getUser;
