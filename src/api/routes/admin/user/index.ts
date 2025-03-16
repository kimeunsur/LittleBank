import { ApiRouter } from "../../default"
import {userCtrl} from "./userCtrl"

const getUsers = new ApiRouter({
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
    200: { schema: 'responses/admin/user/getUsers'}    
  },
  handler: userCtrl.getUsers
})

const getUser = new ApiRouter({
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
    200: { schema: 'responses/admin/user/getUser'}   
  },
  handler: userCtrl.getUser
})

export { 
  getUsers, 
  getUser
}