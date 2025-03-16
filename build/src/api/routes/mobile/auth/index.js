"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getAuthProfiles = exports.postAuthRefresh = exports.postAuthProfile = exports.postAuth = exports.postProfile = exports.postUser = void 0;
const default_1 = require("../../default");
const authCtrl_1 = require("./authCtrl");
const postUser = new default_1.ApiRouter({
    name: 'user',
    method: 'post',
    summary: '가족 계정 회원가입',
    description: `
    v1.0.3
    2024-10-18 12:00
    작성자 : 주지민

    비밀번호 솔트/해쉬 삭제
    ---------------------------------------

    v1.0.2
    2024-09-20 14:00
    작성자 : 주지민

    다날 app sdk로 전환
    ---------------------------------------

    v1.0.1
    2024-08-26 17:00
    작성자 : 주지민

    다날 pass 적용(danalImpUid : string추가)
    ---------------------------------------

    v1.0.0
    2024-07-24 12:00
    작성자 : 주지민
    ---------------------------------------
    
    회원가입

    [required]
    "email" : string
    "password" : string
    "phone" : string
    "socialId" : string    
    
  `,
    tags: ['Auth'],
    isPublic: true,
    schema: 'requests/mobile/auth/postUser',
    responses: {
        200: { schema: 'responses/mobile/auth/postAuth' }
    },
    handler: authCtrl_1.authCtrl.postUser
});
exports.postUser = postUser;
const postProfile = new default_1.ApiRouter({
    name: 'profile',
    method: 'post',
    summary: '프로필 생성',
    description: `
    v1.0.0
    2024-07-24 15:00
    작성자 : 주지민
    ---------------------------------------
    [required]    
    "profilePass" -> string
    "name" -> string
    "relation" -> "enum": ["dad","mom","child"]

    나머지 전부 string 

    추후 은행 관련 require 추가 예정

  `,
    tags: ['Auth'],
    isPublic: false,
    schema: 'requests/mobile/auth/postProfile',
    responses: {
        200: { description: 'success' }
    },
    handler: authCtrl_1.authCtrl.postProfile
});
exports.postProfile = postProfile;
const postAuth = new default_1.ApiRouter({
    name: 'auth',
    method: 'post',
    summary: '가족 계정 로그인',
    description: `
    v1.0.1
    2024-10-18 12:00
    작성자 : 주지민

    비밀번호 솔트/해쉬 삭제
    ---------------------------------------

    v1.0.0
    2024-07-24 12:00
    작성자 : 주지민
    ---------------------------------------
    
  `,
    tags: ['Auth'],
    isPublic: true,
    schema: 'requests/mobile/auth/postAuth',
    responses: {
        200: { schema: 'responses/mobile/auth/postAuth' }
    },
    handler: authCtrl_1.authCtrl.postAuth
});
exports.postAuth = postAuth;
const postAuthProfile = new default_1.ApiRouter({
    name: 'auth/profile/:id',
    method: 'post',
    summary: '프로필 로그인',
    description: `
    v1.0.0
    2024-07-24 19:00
    작성자 : 주지민
    ---------------------------------------

    id -> profileId
    
  `,
    tags: ['Auth'],
    isPublic: false,
    paths: ['common/idPath'],
    responses: {
        200: { schema: 'responses/mobile/auth/postAuthProfile' }
    },
    handler: authCtrl_1.authCtrl.postAuthProfile
});
exports.postAuthProfile = postAuthProfile;
const postAuthRefresh = new default_1.ApiRouter({
    name: 'refresh',
    method: 'post',
    summary: '토큰 갱신',
    description: `
    v1.0.0
    2024-07-24 11:00
    작성자 : 주지민
    ---------------------------------------
    *** profile만 가능, user(가족 계정 토큰)는 refresh 없음 ***
    
    refreshToken 입력시 새로운 accessToken 발급

    v1.0.0
    2024-11-28 13:00
    작성자 : 윤재상
    ---------------------------------------
    로그인 하지 않은 즉, refreshToken과 accessToken이 null인 유저에 대한 예외처리 추가
  `,
    tags: ['Auth'],
    isPublic: true,
    schema: 'requests/mobile/auth/postAuthRefresh',
    responses: {
        200: { schema: 'responses/mobile/auth/postAuthRefresh' },
        400: { description: 'empty_token' },
        401: { description: 'invalid_token' },
        499: { description: 'invalid_refresh_token' }
    },
    handler: authCtrl_1.authCtrl.postAuthRefresh
});
exports.postAuthRefresh = postAuthRefresh;
const getAuthProfiles = new default_1.ApiRouter({
    name: 'profile/list',
    method: 'get',
    summary: '로그인 프로필 조회',
    description: `
    v1.0.1
    2024-09-24 12:00
    작성자 : 주지민

    프로필 비밀번호 추가
    ---------------------------------------

    v1.0.0
    2024-08-09 15:00
    작성자 : 주지민
    ---------------------------------------
    userId -> 유저 아이디
    profileId -> 프로필 아이디
    profileImage -> 프로필 사진   
    relation -> 엄마/아빠/아이
    name -> 이름
    isParent -> true:부모 false:아이
    profilePass -> 프로필 비번 string

  `,
    tags: ['Auth'],
    isPublic: false,
    schema: 'common/page',
    responses: {
        200: { schema: 'responses/mobile/auth/getAuthProfiles' }
    },
    handler: authCtrl_1.authCtrl.getAuthProfiles
});
exports.getAuthProfiles = getAuthProfiles;
const deleteUser = new default_1.ApiRouter({
    name: '',
    method: 'delete',
    summary: '가족 계정 탈퇴',
    description: `
    v1.0.0
    2024-08-20 15:00
    작성자 : 주지민
    ---------------------------------------   

  `,
    tags: ['Auth'],
    isPublic: false,
    responses: {
        200: { description: 'success' }
    },
    handler: authCtrl_1.authCtrl.deleteUser
});
exports.deleteUser = deleteUser;
