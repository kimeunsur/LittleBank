import {ApiRouter} from '../../default'
import {authCtrl} from "./authCtrl"

const getAuth = new ApiRouter({
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
    200: {description: 'success'}    
  },
  handler: authCtrl.getAuth
})

const postAdmin = new ApiRouter({
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
    200: { description: 'success'}  
  },
  handler: authCtrl.postAdmin
})

const postAuth = new ApiRouter({
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
    200: {schema: 'responses/admin/auth/postAuth'}    
  },
  handler: authCtrl.postAuth
})

const deleteAuth = new ApiRouter({
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
    200: { description: 'success'}  
  },
  handler: authCtrl.deleteAuth
})

export {
  getAuth,
  postAdmin,
  postAuth,
  deleteAuth  
}
