"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAuth = exports.postAuth = exports.postAdmin = exports.getAuth = void 0;
const default_1 = require("../../default");
const authCtrl_1 = require("./authCtrl");
const getAuth = new default_1.ApiRouter({
    name: '',
    method: 'get',
    summary: '관리자 로그인 세션 체크',
    description: `
    v1.0.0
    2024-08-09 17:00
    작성자 : 주지민
    ---------------------------------------

    세션 권한 체크
  `,
    tags: ['Auth'],
    isPublic: true,
    responses: {
        200: { description: 'success' }
    },
    handler: authCtrl_1.authCtrl.getAuth
});
exports.getAuth = getAuth;
const postAdmin = new default_1.ApiRouter({
    name: 'admin',
    method: 'post',
    summary: '관리자 생성',
    description: `
    v1.0.1
    2024-10-18 12:00
    작성자 : 주지민

    비밀번호 솔트/해쉬 삭제
    ---------------------------------------

    v1.0.0
    2024-08-09 17:00
    작성자 : 주지민
    ---------------------------------------
    
    adminName : 관리자명
    email : 로그인 eamil
    password : 비밀번호    
  `,
    tags: ['Auth'],
    isPublic: true,
    schema: 'requests/admin/auth/postAdmin',
    responses: {
        200: { description: 'success' }
    },
    handler: authCtrl_1.authCtrl.postAdmin
});
exports.postAdmin = postAdmin;
const postAuth = new default_1.ApiRouter({
    name: '',
    method: 'post',
    summary: '관리자 로그인',
    description: `
    v1.0.1 
    2024-10-18 12:00
    작성자 : 주지민

    비밀번호 솔트/해쉬 삭제
    ---------------------------------------

    v1.0.0
    2024-08-09 17:00
    작성자 : 주지민
    ---------------------------------------

    email : 로그인 eamil
    password : 비밀번호    
  `,
    tags: ['Auth'],
    isPublic: true,
    schema: 'requests/admin/auth/postAuth',
    responses: {
        200: { schema: 'responses/admin/auth/postAuth' }
    },
    handler: authCtrl_1.authCtrl.postAuth
});
exports.postAuth = postAuth;
const deleteAuth = new default_1.ApiRouter({
    name: '',
    method: 'delete',
    summary: '관리자 로그아웃',
    description: `
    v1.0.0
    2024-08-09 17:00
    작성자 : 주지민
    ---------------------------------------
`,
    tags: ['Auth'],
    isPublic: true,
    responses: {
        200: { description: 'success' }
    },
    handler: authCtrl_1.authCtrl.deleteAuth
});
exports.deleteAuth = deleteAuth;
