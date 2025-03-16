import {ApiRouter} from '../../default'
import {authCtrl} from './authCtrl'

const postUser = new ApiRouter({
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
    200: {schema: 'responses/mobile/auth/postAuth'}
  },
  handler: authCtrl.postUser
})

const postProfile = new ApiRouter({
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
    200: {description: 'success'}    
  },
  handler: authCtrl.postProfile
})

const postAuth = new ApiRouter({
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
    200: {schema: 'responses/mobile/auth/postAuth'}
  },
  handler: authCtrl.postAuth
})

const postAuthProfile = new ApiRouter({
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
    200: {schema: 'responses/mobile/auth/postAuthProfile'}
  },
  handler: authCtrl.postAuthProfile
})

const postAuthRefresh = new ApiRouter({
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
    200: {schema: 'responses/mobile/auth/postAuthRefresh'},
    400: {description: 'empty_token'},   
    401: {description: 'invalid_token'},   
    499: {description: 'invalid_refresh_token'}
  },
  handler: authCtrl.postAuthRefresh
})

const getAuthProfiles = new ApiRouter({
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
    200: { schema: 'responses/mobile/auth/getAuthProfiles'}    
  },
  handler: authCtrl.getAuthProfiles
})

const deleteUser = new ApiRouter({
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
    200: { description: 'success'}   
  },
  handler: authCtrl.deleteUser
})

// const postCertifications = new ApiRouter({
//   name: 'danal/certification',
//   method: 'post',
//   summary: '다날 본인인증 요청',  
//   description: `
//     v1.0.0
//     2024-08-26 16:00
//     작성자 : 주지민
//     ---------------------------------------   
    
//     [required]
//     name : string, ex) 홍길동
//     phone : string, ex) 01012345678
//     birth : string, ex) 901212
//     genderDigit : string, ex) 남자 1,3 / 여자 2/4
//     carrier : enum(SKT, KT, LGT)
//     isMvno : boolean, false -> 일반 통신사 / true -> 알뜰폰

//     [res]
//     danalImpUid : string

//   `,
//   tags: ['Auth'],
//   isPublic: true,
//   schema: 'requests/mobile/auth/postCertifications',
//   responses: {
//     200: { schema: 'responses/mobile/auth/postCertifications'}    
//   },
//   handler: authCtrl.postCertifications
// })

// const postCertificationConfrim = new ApiRouter({
//   name: 'danal/confirm',
//   method: 'post',
//   summary: '다날 본인인증 확인',  
//   description: `
//     v1.0.0
//     2024-08-26 18:00
//     작성자 : 주지민
//     ---------------------------------------    
    
//     [required]
//     danalImpUid : string
//     otp : string, ex) 인증번호 129986    

//   `,
//   tags: ['Auth'],
//   isPublic: true,
//   schema: 'requests/mobile/auth/postCertificationConfrim',
//   responses: {
//     200: { description: 'success'}    
//   },
//   handler: authCtrl.postCertificationConfrim
// })

export {
  postUser,
  postProfile,
  postAuth,
  postAuthProfile,
  postAuthRefresh,
  getAuthProfiles,
  deleteUser,
  // postCertifications,
  // postCertificationConfrim
}